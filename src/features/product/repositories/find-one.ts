import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function findProductById(id: string) {
    const rows = await db
        .select()
        .from(products)
        .leftJoin(productVariants, eq(products.id, productVariants.productId))
        .where(eq(products.id, id));

    // Karena leftJoin mengembalikan array flat (satu produk bisa duplikat di setiap baris varian),
    // kita perlu mengelompokkannya (grouping) agar sesuai dengan struktur UI Form yang Anda miliki.
    if (rows.length === 0) return null;

    const firstRow = rows[0];

    // Satukan baris-baris hasil join menjadi satu objek produk dengan array variants
    const productWithVariants = {
        ...firstRow.products,
        // Ambil semua data varian dari baris hasil join, buang yang null jika produk tidak punya varian
        variants: rows
            .map((row) => row.product_variants)
            .filter(
                (variant): variant is NonNullable<typeof variant> =>
                    variant !== null,
            ),
    };

    return productWithVariants;
}
