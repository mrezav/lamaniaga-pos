import { db, db as defaultDb } from "@/db"; // Sesuaikan dengan inisialisasi drizzle kamu
import {
    transactions,
    transactionItems,
    transactionPayments,
    PaymentStatus,
    PaymentMethod,
} from "@/db/schema";

// 1. Definisikan Tipe Data Parameter Input agar Type-Safe
export interface CreateTransactionItemInput {
    productId: string;
    variantId: string;
    productName: string;
    productMerk?: string | null;
    variantSku?: string | null;
    price: number; // Diparsing dari numeric master ke integer rupiah
    quantity: number;
    subtotal: number;
}

export interface CreateTransactionInput {
    storeId: string;
    userId: string;
    invoiceNumber: string;
    subtotal: number;
    discount?: number;
    tax?: number;
    totalAmount: number;
    paymentStatus: PaymentStatus; // Sesuaikan enum PaymentStatusValues Anda
    isInstallment: boolean;
    dueDate?: string | null;
    cashierName: string;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    items: CreateTransactionItemInput[];
}

export type DBTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Menyimpan seluruh data checkout (Transaction, Items, & Payment) ke Database secara Atomik.
 * Mendukung injection client `tx` (Drizzle Transaction) untuk orchestrator tingkat tinggi.
 */
export async function createCheckoutInvoice(
    input: CreateTransactionInput,
    txClient?: DBTransaction, // Opsional: jika ingin di-chaining di dalam transaksi luar yang mengunci stok
) {
    const executeOperations = async (tx: DBTransaction) => {
        // STEP 1: Insert ke tabel `transactions`
        const [newTransaction] = await tx
            .insert(transactions)
            .values({
                storeId: input.storeId,
                userId: input.userId,
                invoiceNumber: input.invoiceNumber,
                subtotal: input.subtotal.toString(),
                discount: input.discount?.toString(),
                tax: input.tax?.toString(),
                totalAmount: input.totalAmount.toString(),
                paymentStatus: input.paymentStatus,
                isInstallment: input.isInstallment,
                dueDate: input.dueDate,
                cashierName: input.cashierName,
            })
            .returning({ id: transactions.id });

        if (!newTransaction?.id) {
            throw new Error(
                "Gagal membuat data transaksi utama (ID tidak ter-generate).",
            );
        }

        // STEP 2: Petakan ID Transaksi baru ke setiap item keranjang
        const itemsWithTxId = input.items.map((item) => ({
            transactionId: newTransaction.id,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            productMerk: item.productMerk,
            variantSku: item.variantSku,
            price: item.price.toString(),
            quantity: item.quantity.toString(),
            subtotal: item.subtotal.toString(),
        }));

        // Bulk Insert ke tabel `transaction_items`
        await tx.insert(transactionItems).values(itemsWithTxId);

        // STEP 3: Insert rekam pembayaran awal ke `transaction_payments` jika ada uang yang dibayarkan
        if (input.amountPaid > 0) {
            await tx.insert(transactionPayments).values({
                transactionId: newTransaction.id,
                amountPaid: input.amountPaid.toString(),
                paymentMethod: input.paymentMethod,
                notes: input.isInstallment
                    ? `Pembayaran cicilan awal sebesar Rp ${input.amountPaid.toLocaleString("id-ID")}`
                    : "Pembayaran lunas di kasir",
            });
        }

        return {
            transactionId: newTransaction.id,
            invoiceNumber: input.invoiceNumber,
        };
    };

    // Jika txClient disuplai dari luar, langsung jalankan query (jangan panggil .transaction lagi)
    if (txClient) {
        return await executeOperations(txClient);
    }

    // Jika dipanggil mandiri tanpa external transaction, bungkus dengan internal db.transaction
    return await defaultDb.transaction(async (internalTx) => {
        return await executeOperations(internalTx);
    });
}
