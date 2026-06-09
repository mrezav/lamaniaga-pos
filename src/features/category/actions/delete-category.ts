"use server";

import { checkPermission } from "@/lib/permission";
import { getStoreBySlug } from "@/lib/store";
import { deleteCategory } from "../repositories/delete-one";

export async function deleteCategoryAction(
    categoryId: string,
    storeSlug: string,
) {
    try {
        const store = await getStoreBySlug(storeSlug);
        const { userId } = await checkPermission(
            store.id,
            "category",
            "delete",
        );
        const result = await deleteCategory(categoryId, store.id);
        return {
            success: true,
            data: result,
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
