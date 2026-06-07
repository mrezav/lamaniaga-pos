import { useQuery } from "@tanstack/react-query";
import { getCategoryByIdAction } from "../actions/get-category";

export function useCategory(categoryId: string, storeSlug: string) {
    return useQuery({
        queryKey: ["category", storeSlug, categoryId],
        queryFn: async () => {
            const response = await getCategoryByIdAction(categoryId, storeSlug);
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
        enabled: !!categoryId && !!storeSlug,
    });
}
