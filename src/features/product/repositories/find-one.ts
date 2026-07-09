import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function findProductById(id: string) {
    const product = await db.query.products.findFirst({
        where: eq(products.id, id),

        with: {
            category: true,
            variants: true,
        },
    });
    return product;
}

export type ProductWithVariants = Awaited<ReturnType<typeof findProductById>>;
