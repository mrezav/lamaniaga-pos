import z from "zod";

export const categorySchema = z.object({
    name: z.string().min(2, "Nama kategori minimal 2 karakter"),
    // slug: z.string().min(2, "Slug minimal 2 karakter"),
    description: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
