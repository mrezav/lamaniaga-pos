import z from "zod";

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8, "Password minimal 8 karakter"),
});

export const registerSchema = z.object({
    fullName: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.email("Email tidak valid"),
    password: z
        .string()
        .regex(
            /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/,
            "Password minimal 8 karakter dan mengandung huruf serta angka",
        ),
});
