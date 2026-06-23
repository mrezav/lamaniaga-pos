"use server";

import { checkPermission } from "@/lib/permission";
import { findCategoryById } from "../repositories";
import { getStoreBySlug } from "@/lib/store";
import { UserAction } from "@/types";

export async function getCategoryByIdAction(
    categoryId: string,
    storeSlug: string,
) {
    try {
        const store = await getStoreBySlug(storeSlug);

        await checkPermission(store.id, "category", UserAction.VIEW);

        const category = await findCategoryById(categoryId, store.id);
        if (!category) {
            return {
                success: false,
                error: "Kategori tidak ditemukan.",
            };
        }
        return { success: true, data: category };
    } catch (error: unknown) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan internal",
        };
    }
}
