"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getInfiniteProductsAction } from "../actions/get-infinite-products";

// Interface parameter input untuk hook
export interface FindProductsParams {
    storeId?: string; // Dibuat optional jika storeSlug dikirimkan
    storeSlug: string;
    search?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
    sortBy?: "name" | "createdAt";
    sortOrder?: "asc" | "desc";
}

export function useInfiniteProducts(params: Omit<FindProductsParams, "page">) {
    const {
        storeId,
        storeSlug,
        search,
        categoryId,
        limit,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = params;

    return useInfiniteQuery({
        // Query Key diperbarui secara otomatis saat parameter search/category/sort berubah
        queryKey: [
            "products",
            storeId,
            storeSlug,
            categoryId,
            search,
            sortBy,
            sortOrder,
            limit,
        ],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await getInfiniteProductsAction({
                storeId: "",
                storeSlug,
                search,
                categoryId,
                page: pageParam as number,
                limit,
                sortBy,
                sortOrder,
            });

            // Jika action gagal atau data null, lemparkan error atau kembalikan struktur default
            if (!response.success || !response.data) {
                throw new Error("Gagal mengambil data produk");
            }

            console.log(
                `Page ${pageParam} fetched:`,
                response.data.items.length,
                "items",
            );

            // Mengembalikan object `result` (InfiniteProductsResponse) secara langsung
            return response.data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            // TypeScript sudah otomatis mengenali tipe `lastPage` sebagai InfiniteProductsResponse
            if (lastPage?.pagination?.hasNextPage) {
                return lastPage.pagination.currentPage + 1;
            }
            return undefined;
        },
    });
}
