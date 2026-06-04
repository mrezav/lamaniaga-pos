import { db } from "@/db";
import { categories } from "@/db/schema";
import { ilike, and, asc, count } from "drizzle-orm";

type findCategoriesOption = {
    page: number;
    pageSize: number;
    search?: string;
};

export async function findManyCategories({
    page,
    pageSize,
    search,
}: findCategoriesOption) {
    const offset = (page - 1) * pageSize;
    const whereClause = and(
        search ? ilike(categories.name, `%${search}%`) : undefined,
    );
    const [items, totalResult] = await Promise.all([
        // db.query.categories.findMany({
        //     where: whereClause,
        //     orderBy: [asc(categories.name)],
        //     limit: pageSize,
        //     offset,
        // }),
        db
            .select()
            .from(categories)
            .where(whereClause)
            .orderBy(asc(categories.name))
            .limit(pageSize)
            .offset(offset),
        db.select({ count: count() }).from(categories).where(whereClause),
    ]);

    const total = totalResult[0]?.count ?? 0;

    return {
        items,
        total,
        page,
        pageSize,
        totalPage: Math.ceil(total / pageSize),
    };
}
