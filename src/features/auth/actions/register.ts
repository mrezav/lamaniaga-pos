"use server";

import { signUpParams } from "../types/auth";
import { registerSchema } from "../schema/auth";
import { signUp } from "../repositories";

export async function register(input: signUpParams) {
    const validated = registerSchema.safeParse(input);
    if (!validated.success) {
        return {
            success: false,
            message: validated.error.issues[0]?.message ?? "Data tidak valid",
        };
    }

    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
    const { error } = await signUp({
        email: validated.data.email,
        fullName: validated.data.fullName,
        password: validated.data.password,
        redirectTo: redirectTo,
    });

    if (error) {
        if (error.message.toLowerCase().includes("already")) {
            return {
                success: false,
                message: "Email sudah terdaftar",
            };
        }

        throw error;
    }
    return { success: true };
}
