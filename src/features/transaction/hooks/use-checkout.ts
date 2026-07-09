"use client";

import { CheckoutRequest } from "@/features/cashier/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { checkoutAction } from "../actions/checkout";

export function useCheckoutMutation(storeSlug: string) {
    return useMutation({
        mutationFn: async (request: CheckoutRequest) => {
            const result = await checkoutAction(storeSlug, request);
            if (!result.success) {
                throw new Error(result.error);
            }
            return { success: true };
        },
        onSuccess: () => {
            toast.success("Transaksi berhasil");
        },
        onError: (err) => {
            console.log(err);
            toast.error("Transaksi gagal");
        },
    });
}
