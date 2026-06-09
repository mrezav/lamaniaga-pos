import z from "zod";

export const categorySchema = z.object({
    name: z.string().min(2, "Nama kategori minimal 2 karakter"),
    description: z
        .string()
        .max(255, "Deskripsi maksimal 255 karakter")
        .optional()
        .nullable(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
