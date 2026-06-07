import { db } from "@/db";
import { categories } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function findCategoryById(id: string, storeId: string) {
    const whereClause = storeId
        ? and(eq(categories.storeId, storeId), eq(categories.id, id))
        : eq(categories.id, id);
    const result = await db
        .select()
        .from(categories)
        .where(whereClause)
        .limit(1);
    return result[0];
}
