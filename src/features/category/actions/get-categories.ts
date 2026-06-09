"use server";

import { getStoreBySlug } from "@/lib/store";
import { findCategoriesByStoreId } from "../repositories";
import { checkPermission } from "@/lib/permission";

interface getCategoriesParams {
    storeSlug: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: "name" | "createdAt";
    sortOrder?: "asc" | "desc";
}

export async function getCategoriesAction(payload: getCategoriesParams) {
    try {
        const store = await getStoreBySlug(payload.storeSlug);

        await checkPermission(store.id, "category", "view");

        const result = await findCategoriesByStoreId({
            storeId: store.id,
            ...payload,
        });

        return {
            success: true,
            data: result,
        };
    } catch (error: unknown) {
        const message =
            error instanceof Error
                ? error.message
                : String(error) || "Gagal load kategori, silakan coba lagi.";
        return {
            success: false,
            data: {
                items: [],
                pagination: {
                    page: 1,
                    limit: 10,
                    totalItems: 0,
                    totalPages: 0,
                },
            },
            error: message,
        };
    }
}
