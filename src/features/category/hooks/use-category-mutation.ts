import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategoryAction } from "../actions";
import { CategoryInput } from "../schemas/category-schema";
import { updateCategoryAction } from "../actions/update-category";

export const useCategoryMutations = (
    storeSlug: string,
    categoryId?: string,
) => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (values: CategoryInput) => {
            // 1. Panggil Server Action
            const response = await createCategoryAction(storeSlug, values);

            // 2. Jika gagal karena Permission/Sistem (ada properti message)
            if (!response.success && response.message) {
                throw new Error(response.message);
            }

            // Kembalikan response apa adanya agar validationErrors bisa dibaca di form
            return response;
        },
        onSuccess: (res) => {
            // Auto invalidasi cache agar data di tabel ter-refresh
            if (res.success) {
                queryClient.invalidateQueries({
                    queryKey: ["categories", storeSlug],
                });
            }
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (values: CategoryInput) => {
            if (!categoryId)
                throw new Error("Category ID dibutuhkan untuk pembaruan data.");
            const response = await updateCategoryAction(
                categoryId,
                storeSlug,
                values,
            );
            if (!response.success && response.message) {
                throw new Error(response.message);
            }
            return response;
        },
        onSuccess: (res) => {
            if (res.success) {
                // Invalidasi cache daftar kategori
                queryClient.invalidateQueries({
                    queryKey: ["categories", storeSlug],
                });
                // Invalidasi cache untuk data kategori spesifik ini berdasarkan ID-nya
                queryClient.invalidateQueries({
                    queryKey: ["category", storeSlug, categoryId],
                });
            }
        },
    });

    return {
        createCategory: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateCategory: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
    };
};
