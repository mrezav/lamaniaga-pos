import { db } from "@/db";
import { productVariants, products } from "@/db/schema";
import { CartItem } from "@/features/cashier/types";
import { eq, inArray } from "drizzle-orm";

export type DBTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Mengunci data, memvalidasi stok & harga, lalu memotong stok secara langsung.
 * Mengembalikan data produk yang valid untuk kebutuhan insert invoice (No Double Query!).
 */
export async function verifyAndDeductStock(
    tx: DBTransaction,
    cartItems: CartItem[],
) {
    const variantIds = cartItems.map((item) => item.id);

    // 1. QUERY + LOCK DATA SEKALIGUS (Mencegah Race Condition)
    const dbVariants = await tx
        .select({
            variantId: productVariants.id,
            price: productVariants.price,
            stock: productVariants.stock,
            sku: productVariants.sku,
            productId: products.id,
            productName: products.name,
            productMerk: products.merk,
        })
        .from(productVariants)
        .innerJoin(products, eq(productVariants.productId, products.id))
        .where(inArray(productVariants.id, variantIds))
        .for("update"); // <-- Mengunci baris di database

    // Validasi jika ada produk yang tidak terdaftar
    if (dbVariants.length !== cartItems.length) {
        throw new Error("Beberapa varian produk tidak ditemukan di sistem.");
    }

    const validatedItemsForInvoice = [];
    let calculatedSubtotal = 0;

    // 2. LOOPING UNTUK VALIDASI DAN UPDATE STOK LANGSUNG
    for (const cartItem of cartItems) {
        const dbItem = dbVariants.find((v) => v.variantId === cartItem.id);
        const dbStock = Number(dbItem?.stock);

        if (!dbItem) throw new Error("Terjadi kesalahan pencocokan data.");

        // Validasi Stok real-time setelah di-lock
        if (dbStock < cartItem.quantity) {
            throw new Error(
                `Stok terbaru untuk ${dbItem.productName} (${dbItem.sku}) tidak mencukupi.`,
            );
        }

        // Hitung Subtotal (Menggunakan harga asli Server bertipe numeric/string)
        const priceNum = Number(dbItem.price);
        const itemSubtotal = priceNum * cartItem.quantity;
        calculatedSubtotal += itemSubtotal;

        // UPDATE STOK LANGSUNG (Menggunakan TX yang sama)
        await tx
            .update(productVariants)
            .set({ stock: (dbStock - cartItem.quantity).toString() })
            .where(eq(productVariants.id, cartItem.id));

        // Kumpulkan data matang untuk di-return (dipakai insert invoice nanti)
        validatedItemsForInvoice.push({
            productId: dbItem.productId,
            variantId: dbItem.variantId,
            productName: dbItem.productName,
            productMerk: dbItem.productMerk,
            variantSku: dbItem.sku,
            price: priceNum,
            quantity: cartItem.quantity,
            subtotal: itemSubtotal,
        });
    }

    // Mengembalikan data hasil kalkulasi server agar tidak perlu query ulang
    return {
        subtotal: calculatedSubtotal,
        items: validatedItemsForInvoice,
    };
}
