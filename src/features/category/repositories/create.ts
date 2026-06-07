import { db } from "@/db";
import { categories } from "@/db/schema";

export async function createCategory(data: {
    name: string;
    slug: string;
    description: string | null;
    storeId: string;
}) {
    return await db
        .insert(categories)
        .values({
            name: data.name,
            slug: data.slug,
            description: data.description,
            storeId: data.storeId,
        })
        .returning();
}
