"use server";

import { verifyAuth } from "@/lib/auth";
import { findUserStores } from "../repositories";

export async function getUserStoresActions() {
    const user = await verifyAuth();
    const storeId = user.id;
    try {
        const userStoreList = await findUserStores(storeId);
        return { success: true, data: userStoreList };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Gagal memuat daftar toko.",
        };
    }
}
