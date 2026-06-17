import { db } from "@/db";
import { categories, products, productVariants } from "@/db/schema";
import { and, asc, desc, eq, ilike } from "drizzle-orm";
import { count } from "drizzle-orm";

interface FindProductsParams {
    storeId: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: "name" | "createdAt";
    sortOrder?: "asc" | "desc";
}

export async function findProductsByStoreId({
    storeId,
    search = "",
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
}: FindProductsParams) {
    const conditions = [eq(products.storeId, storeId)];
    if (search) {
        conditions.push(ilike(products.name, `%${search}%`));
    }

    const whereClause = and(...conditions);
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
                // Ambil semua kolom dari tabel products secara flat
                id: products.id,
                name: products.name,
                merk: products.merk,
                slug: products.slug,
                isActive: products.isActive,
                description: products.description,
                createdAt: products.createdAt,
                price: productVariants.price,
                stock: productVariants.stock,
                categoryId: products.categoryId,
                productVariantId: productVariants.id,
                // Tambahkan kolom category_name dari tabel categories
                category_name: categories.name,
            })
            .from(products)
            .leftJoin(categories, eq(categories.id, products.categoryId))
            .innerJoin(
                productVariants,
                eq(productVariants.productId, products.id),
            )
            .where(whereClause)
            .orderBy(orderClause)
            .limit(limit)
            .offset(offset),
        db.select({ countItems: count() }).from(products).where(whereClause),
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
