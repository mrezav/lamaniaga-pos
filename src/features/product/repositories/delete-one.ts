import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteProduct(id: string) {
    return await db.delete(products).where(eq(products.id, id)).returning();
}
