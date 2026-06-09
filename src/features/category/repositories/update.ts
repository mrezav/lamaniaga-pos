import { db } from "@/db";
import { CategoryInput } from "../schemas/category-schema";
import { categories } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function updateCategory(
    userId: string,
    storeId: string,
    categoryId: string,
    data: CategoryInput,
) {
    const [updateCategory] = await db
        .update(categories)
        .set({
            name: data.name,
            description: data.description,
            modifiedBy: userId,
        })
        .where(
            and(eq(categories.id, categoryId), eq(categories.storeId, storeId)),
        )
        .returning();

    if (!updateCategory) {
        return null;
    }
    return updateCategory;
}
