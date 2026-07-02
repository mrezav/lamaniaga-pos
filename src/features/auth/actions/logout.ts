"use server";

import { getErrorMessage } from "@/lib/utils";
import { signOut } from "../repositories/sign-out";

export async function logoutAction() {
    try {
        const { error } = await signOut();
        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (err) {
        return { success: false, error: getErrorMessage(err) };
    }
}
