import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProductAction } from "@/features/product/actions/create-product";
import { ProductInput } from "@/features/product/schemas/product-schema";

export function useCreateProduct(storeSlug: string) {
    return useMutation({
        mutationFn: async (values: ProductInput) => {
            const result = await createProductAction(storeSlug, values);
            if (!result.success) {
                throw new Error(result.error || "Gagal membuat produk.");
            }
            return result;
        },
        onSuccess: () => {
            toast.success("Produk berhasil dibuat.");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Terjadi kesalahan server.");
        },
    });
}
