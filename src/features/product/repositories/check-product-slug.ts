import { db } from "@/db";
import { products } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export async function productSlugExists(
    slug: string,
    storeId: string,
): Promise<boolean> {
    const product = await db.query.products.findFirst({
        columns: { id: true },
        where: and(
            eq(products.storeId, storeId),
            eq(products.slug, slug),
            isNull(products.deletedAt),
        ),
    });

    return !!product;
}
