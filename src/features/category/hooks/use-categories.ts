import { useQuery } from "@tanstack/react-query";
import { getCategoriesAction } from "../actions";
import { getCategoryListAction } from "@/features/product/actions";

interface useCategoriesProps {
    storeSlug: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy: "name" | "createdAt";
    sortOrder: "asc" | "desc";
}

export const useCategories = (filters: useCategoriesProps) => {
    const { storeSlug, search, page, limit, sortBy, sortOrder } = filters;

    const getCategoriesQuery = useQuery({
        // 1. QUERY KEY: Dibuat flat dan terbaca jelas dari kiri ke kanan (Umum -> Spesifik)
        queryKey: [
            "categories",
            storeSlug,
            { search, page, sortBy, sortOrder },
        ],

        // 2. QUERY FN: Panggil Server Action apa adanya tanpa trik aneh
        queryFn: async () => {
            const result = await getCategoriesAction(filters);

            if (!result.success) {
                throw new Error(result.error);
            }

            return result.data;
        },

        // 3. OPTION TAMBAHAN: Mencegah UI berkedip saat ganti halaman (Pagination)
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 30, // Data dianggap segar selama 30 detik
    });

    const getCategoryListQuery = useQuery({
        queryKey: ["category-list", storeSlug],
        queryFn: async () => {
            const result = await getCategoryListAction(storeSlug);
            console.log(result);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
    });

    return {
        getCategoriesQuery,
        getCategoryListQuery,
    };
};
