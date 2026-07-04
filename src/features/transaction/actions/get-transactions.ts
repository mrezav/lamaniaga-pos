"use server";

import { getErrorMessage } from "@/lib/utils";
import { findTransactions } from "../repositories/find-many";
import { checkPermission } from "@/lib/permission";
import { UserAction } from "@/types";
import { FindTransactionsFilters } from "../types";

export async function getTransactionsAction(payload: FindTransactionsFilters) {
    try {
        await checkPermission(payload.storeId, "transaction", UserAction.VIEW);
        const result = await findTransactions({
            storeId: payload.storeId,
            search: payload.search,
            page: payload.page,
            limit: payload.limit,
            sortBy: payload.sortBy,
            sortOrder: payload.sortOrder,
            paymentStatus: payload.paymentStatus,
            startDate: payload.startDate,
            endDate: payload.endDate,
        });
        console.log("======================================");
        console.log(result);
        console.log("======================================");
        return { success: true, data: result };
    } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
    }
}
