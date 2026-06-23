"use server";

import { checkPermission } from "@/lib/permission";

import { checkExistingJoinCode, setJoinCode } from "../repositories";
import { generateRandomCode, getErrorMessage } from "@/lib/utils";
import { UserAction } from "@/types";

export async function generateJoinCodeAction(storeId: string) {
    try {
        await checkPermission(storeId, "join-code", UserAction.CREATE);

        let joinCode = "";
        let isUnique = false;
        let attempts = 0;

        // Ensure the generated code is unique in the stores table
        while (!isUnique && attempts < 10) {
            joinCode = generateRandomCode();
            const existing = await checkExistingJoinCode(joinCode);

            if (!existing) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            throw new Error(
                "Gagal membuat kode unik setelah beberapa percobaan. Silakan coba lagi.",
            );
        }

        // Update the store's join code
        await setJoinCode(storeId, joinCode);

        return { success: true, joinCode };
    } catch (error: unknown) {
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}
