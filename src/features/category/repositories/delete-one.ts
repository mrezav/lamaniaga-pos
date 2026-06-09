import { db } from "@/db";
import { categories } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function deleteCategory(id: string, storeId: string) {
    return await db
        .delete(categories)
        .where(and(eq(categories.id, id), eq(categories.storeId, storeId)))
        .returning();
}
