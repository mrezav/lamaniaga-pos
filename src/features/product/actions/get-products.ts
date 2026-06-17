"use server";

import { getStoreBySlug } from "@/lib/store";
import { checkPermission } from "@/lib/permission";
import { UserAction } from "@/types";
import { findProductsByStoreId } from "@/features/product/repositories/find-many";

interface GetProductsParams {
    storeSlug: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: "name" | "createdAt";
    sortOrder?: "asc" | "desc";
}

export async function getProductsAction(payload: GetProductsParams) {
    try {
        const store = await getStoreBySlug(payload.storeSlug);
        await checkPermission(store.id, "product", UserAction.VIEW);

        const result = await findProductsByStoreId({
            storeId: store.id,
            search: payload.search,
            page: payload.page,
            limit: payload.limit,
            sortBy: payload.sortBy,
            sortOrder: payload.sortOrder,
        });

        return {
            success: true,
            data: result,
        };
    } catch (error: unknown) {
        const message =
            error instanceof Error
                ? error.message
                : "Gagal mengambil daftar produk.";
        console.error("getProductsAction error:", error);
        return {
            success: false,
            data: {
                items: [],
                pagination: {
                    page: 1,
                    limit: payload.limit ?? 10,
                    totalItems: 0,
                    totalPages: 1,
                },
            },
            error: message,
        };
    }
}
