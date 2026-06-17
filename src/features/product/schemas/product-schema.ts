import { z } from "zod";

export const productVariantSchema = z.object({
    sku: z.string().min(1, "SKU produk wajib diisi"),
    price: z.coerce.number().nonnegative("Harga tidak boleh negatif"),
    stock: z.coerce
        .number()
        .int("Stok harus berupa bilangan bulat")
        .nonnegative("Stok tidak boleh negatif"),
    unit: z.string().min(1, "Unit wajib diisi").default("pcs"),
    size: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
});

export type ProductVariantInput = z.input<typeof productVariantSchema>;
export type ProductVariantValidated = z.infer<typeof productVariantSchema>;

export const productSchema = z.object({
    name: z.string().min(2, "Nama produk minimal 2 karakter").max(255),
    merk: z.string().min(1, "Merk produk wajib diisi").max(100),
    categoryId: z.string().uuid().optional().nullable(),
    description: z
        .string()
        .max(1000, "Deskripsi maksimal 1000 karakter")
        .optional()
        .nullable(),
    imageFile: z.any().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
    hasVariants: z.boolean().default(false),
    variants: z.array(productVariantSchema).default([
        {
            sku: "",
            price: 0,
            stock: 0,
            unit: "pcs",
            size: "",
            color: "",
        },
    ]),
});

export type ProductInput = z.input<typeof productSchema>;
export type ProductValidated = z.infer<typeof productSchema>;
