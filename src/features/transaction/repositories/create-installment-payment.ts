import { db } from "@/db"; // Import instance database Drizzle kamu
import {
    transactions,
    transactionPayments,
    PaymentStatus,
    PaymentMethod,
} from "@/db/schema";
import { eq } from "drizzle-orm";

interface CreatePaymentDTO {
    transactionId: string;
    amountPaid: string;
    paymentMethod: PaymentMethod;
    note?: string;
    // currentTotalPaid: number; // Total yang sudah dibayar sebelum transaksi ini (dari kalkulasi parent)
    // totalAmount: number; // Total harga transaksi asli
    paymentStatus: PaymentStatus;
}

export async function createInstallmentPayment(data: CreatePaymentDTO) {
    // 1. Inisialisasi Drizzle Transaction
    return await db.transaction(async (txContext) => {
        try {
            // 2. Input data ke tabel transaction_payments
            const [newPayment] = await txContext
                .insert(transactionPayments)
                .values({
                    transactionId: data.transactionId,
                    amountPaid: data.amountPaid,
                    paymentMethod: data.paymentMethod,
                    note: data.note,
                })
                .returning();

            // 4. Update status pembayaran di tabel transactions
            await txContext
                .update(transactions)
                .set({ paymentStatus: data.paymentStatus })
                .where(eq(transactions.id, data.transactionId));

            // Kembalikan data pembayaran yang berhasil dibuat
            return newPayment;
        } catch (error) {
            // PENTING: Melempar error di dalam block db.transaction
            // akan otomatis memicu ROLLBACK oleh Drizzle.
            console.error("Transaction failed, rolling back...", error);
            throw error;
        }
    });
}
