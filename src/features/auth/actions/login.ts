"use server";

import { signIn } from "@/features/auth/repositories";
import { loginSchema } from "@/features/auth/schema/auth";
import { getErrorMessage } from "@/utils";

export async function login(input: unknown) {
    try {
        const validated = loginSchema.safeParse(input);

        if (!validated.success) {
            return {
                success: false,
                validationErrors: validated.error.flatten().fieldErrors,
            };
        }

        const { error } = await signIn(
            validated.data.email,
            validated.data.password,
        );
        if (error) {
            return {
                success: false,
                error: "Email atau password salah",
            };
        }

        return {
            success: true,
        };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}
