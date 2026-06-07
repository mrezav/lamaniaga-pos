"use server";

import { signIn } from "@/features/auth/repositories";
import { loginSchema } from "@/features/auth/schema/auth";

export async function login(input: unknown) {
    const validated = loginSchema.safeParse(input);

    if (!validated.success) {
        return {
            success: false,
            message: "Data yang anda masukan salah",
        };
    }

    const { error } = await signIn(
        validated.data.email,
        validated.data.password,
    );
    if (error) {
        return {
            success: false,
            message: "Email atau password salah",
        };
    }

    return {
        success: true,
    };
}
