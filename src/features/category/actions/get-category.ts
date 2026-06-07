"use server";

import { getStoreContext } from "@/lib/action-guards";
import { checkPermission } from "@/lib/permission";
import { findCategoryById } from "../repositories";

export async function getCategoryByIdAction(
    categoryId: string,
    storeSlug: string,
) {
    try {
        const store = await getStoreContext(storeSlug);

        await checkPermission(store.id, "category", "edit");

        const result = await findCategoryById(categoryId, store.id);
        return { success: true, data: result };
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
