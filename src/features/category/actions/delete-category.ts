"use server";

import { checkPermission } from "@/lib/permission";
import { getStoreBySlug } from "@/lib/store";
import { deleteCategory } from "../repositories/delete-one";
import { UserAction } from "@/types";
import { success } from "zod";

export async function deleteCategoryAction(
    categoryId: string,
    storeSlug: string,
) {
    try {
        const store = await getStoreBySlug(storeSlug);
        await checkPermission(store.id, "category", UserAction.DELETE);
        const result = await deleteCategory(categoryId, store.id);
        if (!result) {
            return { success: false, error: "Gagal menghapus kategori" };
        }
        return {
            success: true,
            data: result[0],
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Terjadi masalah internal",
        };
    }
}
