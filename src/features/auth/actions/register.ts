"use server";

import { signUpParams } from "../types/auth";
import { registerSchema } from "../schema/auth";
import { signUp } from "../repositories";
import { getErrorMessage } from "@/utils";

export async function register(input: signUpParams) {
    try {
        const validated = registerSchema.safeParse(input);
        if (!validated.success) {
            return {
                success: false,
                validationErrors: validated.error.flatten().fieldErrors,
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
                    error: "Email sudah terdaftar",
                };
            }

            throw error;
        }
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}
