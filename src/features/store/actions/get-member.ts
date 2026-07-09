"use server";

import { findStoreMembers } from "../repositories";
import { checkPermission } from "@/lib/permission";
import { verifyAuth } from "@/lib/auth";
import { getErrorMessage } from "@/utils";
import { UserAction } from "@/types";

/**
 * Fetches the list of members for a specific store, including their profile information.
 */
export async function getStoreMembersAction(storeId: string) {
    try {
        await verifyAuth();

        await checkPermission(storeId, "membership", UserAction.VIEW);

        const members = await findStoreMembers(storeId);

        return { success: true, data: members };
    } catch (error: unknown) {
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}
