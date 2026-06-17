import { useQuery } from "@tanstack/react-query";
import { getProductsAction } from "@/features/product/actions/get-products";

interface UseProductsParams {
    storeSlug: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: "name" | "createdAt";
    sortOrder?: "asc" | "desc";
}

export function useProducts(filters: UseProductsParams) {
    const { storeSlug, search, page, limit, sortBy, sortOrder } = filters;

    return useQuery({
        queryKey: [
            "products",
            storeSlug,
            { search, page, limit, sortBy, sortOrder },
        ],
        queryFn: async () => {
            const result = await getProductsAction(filters);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 30,
    });
}
