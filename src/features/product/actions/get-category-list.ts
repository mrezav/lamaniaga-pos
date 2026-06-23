"use server";

import { getStoreBySlug } from "@/lib/store";
import { checkPermission } from "@/lib/permission";
import { UserAction } from "@/types";
import { findCategoriesByStoreId } from "@/features/category/repositories";

export async function getCategoryListAction(storeSlug: string) {
    const store = await getStoreBySlug(storeSlug);

    await checkPermission(store.id, "category", UserAction.VIEW);

    const result = await findCategoriesByStoreId({
        storeId: store.id,
        limit: 100,
    });
    if (!result.items[0]) {
        return {
            success: false,
            error: "Tidak menemukan kategori",
        };
    }

    return {
        success: true,
        data: result.items.map((category) => ({
            id: category.id,
            name: category.name,
        })),
    };
}
