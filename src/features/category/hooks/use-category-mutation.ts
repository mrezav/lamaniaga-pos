import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoryInput } from "../schemas/category-schema";
import { updateCategoryAction } from "../actions/update-category";
import { createCategoryAction } from "../actions/create-category";
import { deleteCategoryAction } from "../actions";
import { toast } from "sonner";

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
            if (!response.success && response.error) {
                throw new Error(response.error);
            }

            // Kembalikan response apa adanya agar validationErrors bisa dibaca di form
            return response;
        },
        onSuccess: () => {
            // Auto invalidasi cache agar data di tabel ter-refresh
            queryClient.invalidateQueries({
                queryKey: ["categories", storeSlug],
            });
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
            if (!response.success && response.error) {
                throw new Error(response.error);
            }
            return response;
        },
        onSuccess: () => {
            // Invalidasi cache daftar kategori
            queryClient.invalidateQueries({
                queryKey: ["categories", storeSlug],
            });
            // Invalidasi cache untuk data kategori spesifik ini berdasarkan ID-nya
            queryClient.invalidateQueries({
                queryKey: ["category", storeSlug, categoryId],
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            if (!id)
                throw new Error("Category ID dibutuhkan untuk pembaruan data.");
            const response = await deleteCategoryAction(id, storeSlug);
            if (!response.success && response.error) {
                throw new Error(response.error);
            }
            return response;
        },
        onSuccess: (response) => {
            if (response.data) {
                toast.success(
                    `Berhasil menghapus kategori : ${response.data.name}`,
                );
            }
            // Invalidasi cache daftar kategori
            queryClient.invalidateQueries({
                queryKey: ["categories", storeSlug],
            });
        },
        onError: (error) => toast.error(error.message),
    });

    return {
        createCategory: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateCategory: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteCategory: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
};
