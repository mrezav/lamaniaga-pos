import { db } from "@/db";
import {
    NewProductInput,
    NewVariantInput,
    products,
    productVariants,
} from "@/db/schema";

export async function createProduct(data: NewProductInput) {
    const [product] = await db
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

export async function createProductVariants(variants: NewVariantInput[]) {
    return await db.insert(productVariants).values(
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
