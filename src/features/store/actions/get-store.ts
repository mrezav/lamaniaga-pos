"use server";

import { verifyAuth } from "@/lib/auth";
import { checkPermission } from "@/lib/permission";
import { getStoreBySlug } from "@/lib/store";
import { getErrorMessage } from "@/lib/utils";
import { UserAction } from "@/types";

export async function getStoreAction(storeSlug: string) {
    try {
        await verifyAuth();
        const store = await getStoreBySlug(storeSlug);
        checkPermission(store.id, "store", UserAction.VIEW);
        console.log(store);
        return { success: true, data: store };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}
