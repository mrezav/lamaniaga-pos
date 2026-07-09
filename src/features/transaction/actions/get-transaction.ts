"use server";

import { verifyAuth } from "@/lib/auth";
import { checkPermission } from "@/lib/permission";
import { getStoreBySlug } from "@/lib/store";
import { UserAction } from "@/types";
import { getErrorMessage } from "@/utils";
import { findTransaction } from "../repositories/find-one";

export async function getTransactionAction(id: string, storeSlug: string) {
    try {
        const user = await verifyAuth();
        const store = await getStoreBySlug(storeSlug);
        await checkPermission(store.id, "transaction", UserAction.VIEW);

        const result = await findTransaction(id);

        return { success: true, data: result };
    } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
    }
}
