import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "../services/category-actions";
import { CategoryFormValues } from "../schemas/category-schema";

export const useCreateCategoryMutation = (storeSlug: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (values: CategoryFormValues) => {
            // 1. Panggil Server Action
            const response = await createCategory(storeSlug, values);

            // 2. Jika Server Action mengembalikan success: false (gagal di guard/validasi)
            // Kita lemparkan sebagai error agar TanStack Query tahu ini adalah kegagalan
            if (!response.success) {
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
};
