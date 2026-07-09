"use server";

import { verifyAuth } from "@/lib/auth";
import { findUserProfile } from "../repositories";

export async function getCurrentProfileAction() {
    try {
        const user = await verifyAuth();
        const profiles = await findUserProfile(user.id);
        if (!profiles) {
            return { success: false, error: "Profile tidak ditemukan" };
        }
        return { success: true, data: profiles };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan internal",
        };
    }
}
