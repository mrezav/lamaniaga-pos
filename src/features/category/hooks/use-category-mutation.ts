import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateCategoryInput } from "../schemas/category-schema";
import { createCategoryAction } from "../actions";

export const useCategoryMutations = (storeSlug: string) => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (values: CreateCategoryInput) => {
            // 1. Panggil Server Action
            const response = await createCategoryAction(storeSlug, values);

            // 2. Jika Server Action mengembalikan success: false (gagal di guard/validasi)
            // Kita lemparkan sebagai error agar TanStack Query tahu ini adalah kegagalan
            if (!response.success) {
                if (typeof response.error === "object") {
                    throw new Error("Validasi input gagal.");
                }
                throw new Error(response.message || "Gagal membuat kategori.");
            }

            // 3. Jika sukses sejati, kembalikan data responnya
            return response;
        },
        onSuccess: () => {
            // Auto invalidasi cache agar data di tabel ter-refresh
            queryClient.invalidateQueries({
                queryKey: ["categories", storeSlug],
            });
        },
    });

    return {
        createCategory: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        error: createMutation.error,
    };
};
