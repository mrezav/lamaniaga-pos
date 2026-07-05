import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function findTransaction(id: string) {
    return db.query.transactions.findFirst({
        where: eq(transactions.id, id),
        with: { transactionItems: true, transactionPayments: true },
    });
}

// Membuat tipe baru hasil dari query
export type TransactionDetail = Awaited<ReturnType<typeof findTransaction>>;
