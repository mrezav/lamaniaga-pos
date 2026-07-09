import { db } from "@/db";
import {
    NewProductInput,
    NewVariantInput,
    products,
    productVariants,
} from "@/db/schema";

export type DBTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function createProduct(data: NewProductInput, tx?: DBTransaction) {
    const client = tx || db;
    const [product] = await client
        .insert(products)
        .values({
            name: data.name,
            merk: data.merk,
            slug: data.slug,
            description: data.description,
            categoryId: data.categoryId,
            imageUrl: data.imageUrl,
            isActive: data.isActive,
            storeId: data.storeId,
        })
        .returning();

    return product;
}

// Sesuaikan tipe `tx` dengan DB Anda. Jika bingung tipenya, Anda bisa gunakan `any` sementara,
// atau gunakan instance generik dari Drizzle.
export async function createProductVariants(
    variants: NewVariantInput[],
    tx?: DBTransaction, // 👈 Tambahkan parameter opsional tx di sini
) {
    // KUNCI: Gunakan `tx` jika tersedia, jika tidak ada fallback ke `db` biasa
    const client = tx || db;

    return await client.insert(productVariants).values(
        variants.map((variant) => ({
            productId: variant.productId,
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
            unit: variant.unit,
            attributes: variant.attributes,
            storeId: variant.storeId,
        })),
    );
}
