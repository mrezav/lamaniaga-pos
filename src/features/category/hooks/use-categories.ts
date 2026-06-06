import { useQuery } from "@tanstack/react-query";
import { getCategoriesAction } from "../actions";

interface useCategoriesProps {
    storeSlug: string;
    search?: string;
    page?: number;
    sortBy: "name" | "createdAt";
    sortOrder: "asc" | "desc";
}

export const categoryKeys = {
    list: (filters: useCategoriesProps) => ["categories", filters] as const,
};

export function useCategories(filters: useCategoriesProps) {
    return useQuery({
        queryKey: categoryKeys.list(filters),
        queryFn: async () => {
            const result = await getCategoriesAction(filters);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 30,
    });
}
