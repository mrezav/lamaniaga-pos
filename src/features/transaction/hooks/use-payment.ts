"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { installmentPaymentAction } from "../actions/installment-payment";
import { toast } from "sonner";

export interface usePaymentRequest {
    storeSlug: string;
    transactionId: string;
    amountPaid: number;
    paymentMethod: string;
    note: string;
}

export function usePaymentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (req: usePaymentRequest) => {
            const response = await installmentPaymentAction(req);
            if (!response.success) {
                throw new Error(response.error);
            }
            return response.data;
        },
        onSuccess: (res) => {
            toast.success("Pembayaran berhasil");
            queryClient.invalidateQueries({
                queryKey: ["transaction", res?.transactionId],
            });
        },
        onError: (err) => {
            toast.error("Pembayaran gagal");
            console.log(err.message);
        },
    });
}
