"use server";

import { db } from "@/db";
import { CheckoutRequest } from "@/features/cashier/types";
import { checkPermission } from "@/lib/permission";
import { getStoreBySlug } from "@/lib/store";
import { generateInvoiceId, getErrorMessage } from "@/lib/utils";
import { UserAction } from "@/types";
import { verifyAndDeductStock } from "../repositories/verify-stock";
import { createCheckoutInvoice } from "../repositories/create-transaction";
import { PaymentMethod, PaymentStatus } from "@/db/schema";

// TODO: SISTEM PAJAK DINAMIS
export async function checkoutAction(
    storeSlug: string,
    payload: CheckoutRequest,
) {
    try {
        const store = await getStoreBySlug(storeSlug);
        const { userId } = await checkPermission(
            store.id,
            "transaction",
            UserAction.CREATE,
        );

        // panggil query tx untuk insert data transaction
        // console.log("=================REQUEST DATA=================");
        // console.log(payload);
        // console.log("==============================================");

        const result = await db.transaction(async (tx) => {
            // STEP 1: Validasi harga, cek stok, dan POTONG STOK langsung (Hanya 1x Query Join)
            const stockProcess = await verifyAndDeductStock(tx, payload.cart);

            // STEP 2: Validasi apakah total belanja dari kasir sama dengan kalkulasi mutlak server
            // (Asumsi di sini tanpa diskon/pajak dahulu, sesuaikan dengan kebutuhanmu)
            if (stockProcess.subtotal !== payload.subTotal) {
                // Jika harga berubah tepat sebelum diklik, lempar error untuk memicu AUTOMATIC ROLLBACK stok
                throw new Error(
                    "Harga produk telah berubah. Silakan perbarui keranjang Anda.",
                );
            }

            let paymentStatus = PaymentStatus.PAID as PaymentStatus;
            if (payload.isInstallment && payload.cashAmount > 0) {
                paymentStatus = PaymentStatus.PARTIAL;
            } else if (payload.isInstallment && payload.cashAmount <= 0) {
                paymentStatus = PaymentStatus.UNPAID;
            }

            const tax = 0; // 0.11 jika terdapat ppn 11%
            const taxAmount = stockProcess.subtotal * (tax / 100);
            const totalAmount = stockProcess.subtotal + taxAmount;

            const invGenerated = generateInvoiceId();

            // STEP 3: Masukkan data invoice ke 3 tabel menggunakan data matang dari `stockProcess`
            const invoice = await createCheckoutInvoice(
                {
                    storeId: store.id,
                    userId: userId,
                    invoiceNumber: invGenerated,
                    subtotal: stockProcess.subtotal,
                    totalAmount: totalAmount, // Total tagihan
                    paymentStatus: paymentStatus,
                    isInstallment: payload.isInstallment,
                    cashierName: payload.cashierName,
                    paymentMethod: payload.paymentMethod as PaymentMethod,
                    amountPaid: payload.cashAmount,
                    items: stockProcess.items, // <-- Menggunakan data hasil join di repository stock
                },
                tx,
            ); // <-- Mengoper TX yang sama

            return invoice;
        });

        // Jika sampai di sini, COMMIT otomatis terjadi di semua file repository
        return { success: true, data: result };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}
