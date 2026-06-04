import z from "zod";
import { loginSchema, registerSchema } from "../schema/auth";

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type signUpParams = {
    fullName: string;
    email: string;
    password: string;
    redirectTo?: string;
};
