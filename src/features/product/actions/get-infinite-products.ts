"use server";

import { checkPermission } from "@/lib/permission";
import { FindProductsParams } from "../types";
import { UserAction } from "@/types";
import { getStoreBySlug } from "@/lib/store";
import { findInfiniteProducts } from "../repositories/find-infinite-products";
import { getErrorMessage } from "@/utils";

export async function getInfiniteProductsAction(params: FindProductsParams) {
    try {
        const { storeSlug } = params;

        const store = await getStoreBySlug(storeSlug || "");
        // Verify permission kasir/user
        await checkPermission(store.id, "product", UserAction.VIEW);
        if (store.id) {
            params.storeId = store.id;
        }

        const result = await findInfiniteProducts(params);

        return {
            success: true,
            data: result,
        };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}
