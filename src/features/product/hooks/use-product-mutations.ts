import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProductAction } from "@/features/product/actions/create-product";
import { updateproductAction } from "../actions/update-product";
import { deleteProductAction } from "../actions";

export const useProductMutations = (storeSlug: string) => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const response = await createProductAction(formData, storeSlug);
            // Kondisi saat terjadi error internal
            if (!response.success && response.error) {
                throw new Error(response.error);
            }
            // error validasi akan tetap di return
            return response;
        },
        onSuccess: () => {
            toast.success("Produk berhasil dibuat.");
            queryClient.invalidateQueries({
                queryKey: ["products", storeSlug],
            });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // 2. Mutation untuk Update
    const updateMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            /* API call */
            const response = await updateproductAction(formData, storeSlug);
            if (!response.success && response.error) {
                throw new Error(response.error);
            }
            return response;
        },
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ["products", storeSlug],
            }),
    });

    // 3. Mutation untuk Delete
    const deleteMutation = useMutation({
        mutationFn: async (productId: string) => {
            const response = await deleteProductAction(storeSlug, productId);
            if (!response.success) {
                throw new Error(response.error);
            }
            return response;
        },
        onSuccess: (response) => {
            toast.message(`Berhasil menghapus produk : ${response.data}`);
            queryClient.invalidateQueries({
                queryKey: ["products", storeSlug],
            });
        },
        onError: (err) => toast.error(err.message),
    });
    return {
        // Actions (Fungsi untuk dieksekusi)
        createProduct: createMutation.mutateAsync,
        updateProduct: updateMutation.mutateAsync,
        deleteProduct: deleteMutation.mutateAsync,

        // Loading States
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,

        // Error States (Opsional, jika butuh handle error di UI secara langsung)
        createError: createMutation.error,
        updateError: updateMutation.error,
        deleteError: deleteMutation.error,
    };
};
