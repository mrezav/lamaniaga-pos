import z from "zod";

export const createCategorySchema = z.object({
    name: z.string().min(2, "Nama kategori minimal 2 karakter"),
    description: z
        .string()
        .max(255, "Deskripsi maksimal 255 karakter")
        .optional()
        .nullable(),
    slug: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
