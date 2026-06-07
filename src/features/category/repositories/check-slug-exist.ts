import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function checkCategorySlugExists(
    slug: string,
    storeId: string,
): Promise<boolean> {
    const result = await db
        .select({ id: categories.id })
        .from(categories)
        .where(and(eq(categories.storeId, storeId), eq(categories.slug, slug)))
        .limit(1);

    return result.length > 0;
}
