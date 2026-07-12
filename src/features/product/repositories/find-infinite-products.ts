import { db } from "@/db";
import { products } from "@/db/schema/products";
import { eq, and, ilike, or, asc, desc, sql } from "drizzle-orm";
import { FindProductsParams, InfiniteProductsResponse } from "../types";

export async function findInfiniteProducts(
    params: FindProductsParams,
): Promise<InfiniteProductsResponse> {
    const {
        storeId,
        search = "",
        categoryId = "",
        page = 1,
        limit = 5,
        sortBy = "name",
        sortOrder = "asc",
    } = params;

    const offset = (page - 1) * limit;

    // 1. Kumpulkan kondisi filter
    const conditions = [
        eq(products.storeId, storeId),
        eq(products.isActive, true),
    ];

    if (categoryId !== "" && categoryId !== "all") {
        conditions.push(eq(products.categoryId, categoryId));
    }

    // Search hanya pada product.name ATAU product.merk
    if (search && search.trim() !== "") {
        const searchPattern = `%${search.trim()}%`;
        conditions.push(
            or(
                ilike(products.name, searchPattern),
                ilike(products.merk, searchPattern),
            )!,
        );
    }

    const whereClause = and(...conditions);

    // 2. Pengurutan (Sorting)
    const sortColumn =
        sortBy === "createdAt" ? products.createdAt : products.name;
    const orderByClause =
        sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn);

    // 3. Query Data dengan Relasional (Select Kolom Spesifik)
    const data = await db.query.products.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [orderByClause],
        columns: {
            id: true,
            name: true,
            merk: true,
            slug: true,
            imageUrl: true,
        },
        with: {
            category: {
                columns: {
                    id: true,
                    name: true,
                },
            },
            variants: {
                columns: {
                    id: true,
                    sku: true,
                    price: true,
                    stock: true,
                    unit: true,
                    attributes: true,
                },
            },
        },
    });

    // 4. Query Total Count untuk Pagination
    const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause);

    // Formatting response agar ramah UI
    const formattedProducts = data.map((product) => ({
        ...product,
        categoryId: product.category?.id ?? null,
        categoryName: product.category?.name ?? null,
        variants: product.variants.map((variant) => ({
            ...variant,
            // Mengubah string "10.00" dari Postgres menjadi number 10
            stock: Number(variant.stock ?? 0),
        })),
    }));

    const total = Number(count);
    const totalPages = Math.ceil(total / limit);

    return {
        items: formattedProducts,
        pagination: {
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            totalData: total,
        },
    };
}
