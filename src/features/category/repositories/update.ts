import { db } from "@/db";
import { CategoryInput } from "../schemas/category-schema";
import { Category } from "../types";
import { categories } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function updateCategory(
    categoryId: string,
    storeId: string,
    data: CategoryInput,
): Promise<Category | null> {
    const [updateCategory] = await db
        .update(categories)
        .set({ name: data.name, description: data.description })
        .where(
            and(eq(categories.id, categoryId), eq(categories.storeId, storeId)),
        )
        .returning();

    if (!updateCategory) {
        return null;
    }
    return updateCategory;
}
