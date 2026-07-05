"use server";

import { findProductById } from "../repositories/find-one";
import { getErrorMessage } from "@/utils";
import { checkPermission } from "@/lib/permission";
import { getStoreBySlug } from "@/lib/store";
import { UserAction } from "@/types";

export default async function getProductByIdAction(
    storeSlug: string,
    productId: string,
    userAction: UserAction,
) {
    try {
        const store = await getStoreBySlug(storeSlug);
        await checkPermission(store.id, "product", userAction);
        const result = await findProductById(productId);
        if (!result) {
            return {
                success: false,
                error: "Product Tidak Ditemukan",
            };
        }
        return { success: true, data: result };
    } catch (error: unknown) {
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}
