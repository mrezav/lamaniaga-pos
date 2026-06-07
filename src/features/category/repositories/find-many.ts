import { db } from "@/db";
import { categories } from "@/db/schema";
import { and, asc, count, desc, eq, ilike } from "drizzle-orm";

interface getCategoriesParams {
    storeId: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: "name" | "createdAt";
    sortOrder?: "asc" | "desc";
}

export async function findCategoriesByStoreId({
    storeId,
    search = "",
    page = 1,
    limit = 10,
    sortBy = "name",
    sortOrder = "desc",
}: getCategoriesParams) {
    const conditions = [eq(categories.storeId, storeId)];
    if (search) {
        conditions.push(ilike(categories.name, `%${search}%`));
    }

    const whereClause = and(...conditions);
    const orderClause =
        sortBy === "name"
            ? sortOrder === "asc"
                ? asc(categories.name)
                : desc(categories.name)
            : sortOrder === "asc"
              ? asc(categories.createdAt)
              : desc(categories.createdAt);

    const offset = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
        db.query.categories.findMany({
            where: whereClause,
            orderBy: [orderClause],
            limit: limit,
            offset: offset,
        }),
        db.select({ countItems: count() }).from(categories).where(whereClause),
    ]);

    const totalItems = totalCount[0]?.countItems || 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    return {
        items: data,
        pagination: {
            page,
            limit,
            totalItems,
            totalPages,
        },
    };
}
