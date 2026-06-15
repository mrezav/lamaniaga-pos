"use server";

import { verifyAuth } from "@/lib/auth";
import { checkPermission } from "@/lib/permission";
import { updateMemberStatus } from "../repositories";
import { MemberStatus } from "@/db/schema";
import { getErrorMessage } from "@/lib/utils";
import { UserAction } from "@/types";

export async function updateMemberStatusAction(
    storeId: string,
    memberId: string,
    status: MemberStatus,
) {
    try {
        await verifyAuth();

        checkPermission(storeId, "membership", UserAction.EDIT);

        await updateMemberStatus(memberId, status);

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}
