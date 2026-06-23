import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { eq, inArray, InferInsertModel } from "drizzle-orm";
import { UpdateProductFormValues } from "../schemas/product-schema";

type DBVariantInsert = InferInsertModel<typeof productVariants>;

export async function updateProduct(
    validatedData: UpdateProductFormValues,
    productId: string,
    newImageUrl?: string | null,
    deletedVariantIds?: string[],
): Promise<boolean> {
    return await db.transaction(async (tx) => {
        // 1. Update data produk utama
        await tx
            .update(products)
            .set({
                name: validatedData.name,
                merk: validatedData.merk,
                categoryId: validatedData.categoryId,
                description: validatedData.description,
                isActive: validatedData.isActive,
                imageUrl: newImageUrl ?? validatedData.imageUrl,
                storeId: validatedData.storeId,
            })
            .where(eq(products.id, productId));

        // 2. Update dan insert data varian langsung berdasarkan ID-nya masing-masing
        for (const variant of validatedData.variants) {
            const dbAttributes: Record<string, string | number | boolean> = {
                size: variant.size || "",
                color: variant.color || "",
            };

            if (!variant.id) {
                // INSERT: Bentuk objek yang strict mematuhi aturan InferInsertModel Drizzle
                const insertPayload: DBVariantInsert = {
                    productId: productId,
                    sku: variant.sku,
                    price: variant.price.toString(),
                    stock: Number(variant.stock),
                    unit: variant.unit,
                    attributes: dbAttributes,
                    storeId: validatedData.storeId,
                };

                await tx.insert(productVariants).values(insertPayload);
            } else {
                // UPDATE: Kita bentuk payload khusus update (bisa partial)
                const updatePayload = {
                    sku: variant.sku,
                    price: variant.price.toString(),
                    stock: Number(variant.stock),
                    unit: variant.unit,
                    attributes: dbAttributes,
                    storeId: validatedData.storeId,
                };

                await tx
                    .update(productVariants)
                    .set(updatePayload)
                    .where(eq(productVariants.id, variant.id));
            }
        }

        if (deletedVariantIds && deletedVariantIds?.length > 0) {
            await tx
                .delete(productVariants)
                .where(inArray(productVariants.id, deletedVariantIds));
        }
        return true;
    });
}
