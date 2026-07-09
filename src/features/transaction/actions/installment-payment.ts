"use server";

import { getErrorMessage } from "@/utils";
import { createInstallmentPayment } from "../repositories/create-installment-payment";
import { PaymentMethod, PaymentStatus } from "@/db/schema";
import { findTransaction } from "../repositories/find-one";
import { checkPermission } from "@/lib/permission";
import { getStoreBySlug } from "@/lib/store";
import { UserAction } from "@/types";
import { usePaymentRequest } from "../hooks/use-payment";

export async function installmentPaymentAction(req: usePaymentRequest) {
    try {
        let paymentStatus = PaymentStatus.PAID as PaymentStatus;
        const store = await getStoreBySlug(req.storeSlug);
        await checkPermission(store.id, "transaction", UserAction.CREATE);

        const tx = await findTransaction(req.transactionId);
        if (!tx) {
            return { success: false, error: "Transaksi tidak ditemukan" };
        }

        const totalInstallmentPaid = tx.transactionPayments.reduce(
            (acc, p) => acc + Number(p.amountPaid),
            0,
        );
        // Jika total tagihan masih lebih besar dari semua pembayaran (baru dan lama)
        if (
            Number(tx.totalAmount) >
            totalInstallmentPaid + Number(req.amountPaid)
        ) {
            paymentStatus = PaymentStatus.PARTIAL;
        }

        const payload = {
            transactionId: tx.id,
            amountPaid: req.amountPaid.toString(),
            paymentMethod: req.paymentMethod as PaymentMethod,
            note: req.note,
            paymentStatus: paymentStatus,
        };

        const result = await createInstallmentPayment(payload);
        return { success: true, data: result };
    } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
    }
}
