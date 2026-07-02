import { db } from "@/db";
import { categories, products, productVariants } from "@/db/schema";
import {
    and,
    asc,
    countDistinct,
    desc,
    eq,
    ilike,
    inArray,
    or,
    SQL,
    sql,
} from "drizzle-orm";
import { count } from "drizzle-orm";
import {
    FindProductsParams,
    FindProductsResponse,
    ProductVariantItem,
} from "../types";

export async function findVariantsByIds(variantIds: string[]) {
    return await db
        .select({
            id: productVariants.id,
            sku: productVariants.sku,
            price: productVariants.price,
            stock: productVariants.stock,
            attributes: productVariants.attributes,
            productId: products.id,
            productName: products.name,
            productMerk: products.merk,
        })
        .from(productVariants)
        .innerJoin(products, eq(productVariants.productId, products.id))
        .where(inArray(productVariants.id, variantIds));
}

export async function findProductsByStoreId({
    storeId,
    search = "",
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
}: FindProductsParams): Promise<FindProductsResponse> {
    const conditions: SQL[] = [eq(products.storeId, storeId)];
    let searchOrderBy: SQL | undefined = undefined;

    if (search) {
        // 1. Ubah join menjadi '|' (OR). Contoh: 'shampo | sunsilk'
        // Setiap kata ditambahkan ':*' agar berfungsi sebagai wildcard (seperti ILIKE 'kata%')
        const searchTerms = search
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => `${word}:*`)
            .join(" | ");

        if (searchTerms) {
            // 2. Gabungkan text vector yang mau dicari
            const documentVector = sql`to_tsvector('indonesian', ${products.name} || ' ' || COALESCE(${products.merk}, '') || ' ' || COALESCE(${categories.name}, ''))`;
            const searchQuery = sql`to_tsquery('indonesian', ${searchTerms})`;

            // Kondisi: Munculkan produk yang mengandung SALAH SATU atau semua kata
            conditions.push(sql`${documentVector} @@ ${searchQuery}`);

            // 3. Hitung skor relevansi (Ranking)
            searchOrderBy = sql`ts_rank(${documentVector}, ${searchQuery}) DESC`;
        }
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderClause =
        sortBy === "name"
            ? sortOrder === "asc"
                ? asc(products.name)
                : desc(products.name)
            : sortOrder === "asc"
              ? asc(products.createdAt)
              : desc(products.createdAt);

    const offset = (page - 1) * limit;

    const [items, totalCount] = await Promise.all([
        db
            .select({
                id: products.id,
                name: products.name,
                merk: products.merk,
                imageUrl: products.imageUrl,
                slug: products.slug,
                isActive: products.isActive,
                description: products.description,
                createdAt: products.createdAt,
                categoryId: products.categoryId,
                categoryName: categories.name,

                // Agregasi relasi One-to-Many (Varian) menjadi array JSON
                variants: sql<ProductVariantItem[]>`COALESCE(
            json_agg(
              json_build_object(
                'id', ${productVariants.id},
                'sku', ${productVariants.sku},
                'price', ${productVariants.price},
                'stock', ${productVariants.stock},
                'attributes', ${productVariants.attributes},
                'unit', ${productVariants.unit}
              )
            ) FILTER (WHERE ${productVariants.id} IS NOT NULL), 
            '[]'::json
          )`.as("variants"),
            })
            .from(products)
            .leftJoin(categories, eq(categories.id, products.categoryId))
            .leftJoin(
                productVariants,
                eq(productVariants.productId, products.id),
            )
            .where(whereClause)
            .orderBy(orderClause)
            .limit(limit)
            .offset(offset)
            // ATURAN EMAS SQL: Semua kolom non-agregasi di atas WAJIB masuk ke groupBy
            .groupBy(products.id, categories.id),

        // ----------------------------------------------------
        // QUERY 2: Hitung Total Produk Unik untuk Pagination
        // ----------------------------------------------------
        db
            .select({ countItems: countDistinct(products.id) }) // Menghitung produk unik yang lolos filter
            .from(products)
            .leftJoin(categories, eq(categories.id, products.categoryId))
            .leftJoin(
                productVariants,
                eq(productVariants.productId, products.id),
            )
            .where(whereClause),
    ]);

    const totalItems = Number(totalCount[0]?.countItems ?? 0);
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return {
        items,
        pagination: {
            page,
            limit,
            totalItems,
            totalPages,
        },
    };
}
