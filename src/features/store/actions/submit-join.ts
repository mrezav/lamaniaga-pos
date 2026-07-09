"use server";

import { verifyAuth } from "@/lib/auth";
import { JoinStoreInput } from "../schemas/join-schema";
import {
    findStoreByCode,
    reApplyCode,
    applyCode,
    findStoreMember,
} from "../repositories";
import { getErrorMessage } from "@/utils";

export async function submitJoinCodeAction(input: JoinStoreInput) {
    try {
        const user = await verifyAuth();

        const formattedCode = input.joinCode.trim().toUpperCase();

        // 1. Find store by join code
        const store = await findStoreByCode(formattedCode);

        if (!store) {
            return {
                success: false,
                error: "Toko tidak ditemukan. Pastikan kode yang dimasukkan sudah benar.",
            };
        }

        const storeMember = await findStoreMember(store.id, user.id);

        // 2. Check if the user is the owner of the store
        if (storeMember) {
            switch (storeMember.status) {
                case "pending":
                    return {
                        success: false,
                        error: "Sudah mendaftar, Silahkan tunggu persetujuan",
                    };
                case "active":
                    return {
                        success: false,
                        error: "Anda sudah terdaftar di toko ini",
                    };
                default:
                    await reApplyCode(storeMember.id);
                    return { success: true };
            }
        }

        await applyCode(user.id, store.id);
        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}
