import { productSlugExists } from "@/features/product/repositories/check-product-slug";

const normalizeSlug = (text: string) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

export async function generateProductSlug(name: string, storeId: string) {
    const baseSlug = normalizeSlug(name);
    let candidate = baseSlug;
    let suffix = 1;

    while (await productSlugExists(candidate, storeId)) {
        candidate = `${baseSlug}-${suffix}`;
        suffix += 1;
    }

    return candidate;
}
