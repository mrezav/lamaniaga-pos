import { z } from "zod";

// Konfigurasi batasan validasi
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB dalam bytes
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const productVariantSchema = z.object({
    // KUNCI: Jadikan ID opsional dan nullable
    // Saat Create: nilainya kosong (undefined/null), DB akan auto-generate UUID
    // Saat Edit: nilainya berisi UUID lama dari DB, dan Zod akan meloloskannya
    id: z.string().uuid().optional().nullable(),
    sku: z.string().optional().nullable(),
    price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
    stock: z.coerce
        .number()
        .int("Stok harus berupa bilangan bulat") // .int() ditaruh di awal setelah number
        .min(0, "Stok tidak boleh negatif"), // Menggunakan .min(0) agar angka 0 (stok habis) bisa di-save
    unit: z.string().min(1, "Unit wajib diisi").default("pcs"),
    size: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
});

export type ProductVariantInput = z.input<typeof productVariantSchema>;
export type ProductVariantOutput = z.infer<typeof productVariantSchema>;

export const productSchema = z.object({
    name: z.string().min(2, "Nama produk minimal 2 karakter").max(255),
    merk: z.string().min(1, "Merk produk wajib diisi").max(100),
    categoryId: z
        .string()
        .uuid("Format ID kategori tidak valid")
        .nullable() // 1. Izinkan nilai null masuk dari rawData
        .refine((val) => val !== null && val !== "", {
            message: "Kategori belum dipilih", // 2. Blokir jika nilainya null saat validasi akhir
        }),
    description: z
        .string()
        .max(1000, "Deskripsi maksimal 1000 karakter")
        .optional()
        .nullable(),
    imageFile: z
        .custom<File | null | undefined>()
        .refine(
            // Lolos jika tidak ada file, ATAU jika ada file dan ukurannya di bawah 2MB
            (file) =>
                !file ||
                !(file instanceof File) ||
                file.size === 0 ||
                file.size <= MAX_FILE_SIZE,
            "Ukuran gambar maksimal adalah 2MB.",
        )
        .refine(
            // Lolos jika tidak ada file / file kosong, ATAU formatnya sesuai
            (file) =>
                !file ||
                !(file instanceof File) ||
                file.size === 0 ||
                ACCEPTED_IMAGE_TYPES.includes(file.type),
            "Format gambar harus berupa .jpg, .jpeg, .png, atau .webp.",
        )
        .optional()
        .nullable(),
    imageUrl: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
    hasVariants: z.boolean().default(false),
    variants: z
        .array(productVariantSchema)
        .min(1, "Minimal harus ada 1 data harga dan stok utama"),
});

export type ProductInput = z.input<typeof productSchema>;
export type ProductOutput = z.infer<typeof productSchema>;

// 1. Definisikan ulang skema varian khusus untuk EDIT
// Kita perlu id opsional (untuk mendeteksi varian lama vs varian baru yang ditambahkan saat edit)
export const editProductVariantSchema = productVariantSchema.extend({
    id: z.string().uuid().optional(),
});

// 2. RE-USE productSchema utama untuk kebutuhan EDIT
export const editProductSchema = productSchema
    .extend({
        // Wajib ada ID produk saat edit
        id: z.string().uuid("ID produk tidak valid"),
        variants: z.array(z.any()), // terima mentah dulu dari DB
        // Gunakan array dari skema varian edit yang sudah kita sesuaikan di atas
        // variants: z
        //     .array(editProductVariantSchema)
        //     .min(1, "Minimal harus ada 1 data harga dan stok utama"),
    })
    .transform((val) => {
        // Jalankan transformasi otomatis di sini saat .parse() dipanggil
        return {
            ...val,
            variants: val.variants.map((v) => ({
                id: v.id,
                sku: v.sku,
                price: typeof v.price === "string" ? Number(v.price) : v.price,
                stock: v.stock,
                unit: v.unit,
                size: v.attributes?.size || "",
                color: v.attributes?.color || "",
            })),
        };
    });

// Tipe data final yang digunakan oleh initialData dan komponen UI Form
export type EditProductFormValues = z.infer<typeof editProductSchema>;

export const updateProductSchema = productSchema.extend({
    // Wajib ada ID produk saat edit
    id: z.string().uuid("ID produk tidak valid"),
    storeId: z.uuid(),
    // Gunakan array dari skema varian edit yang sudah kita sesuaikan di atas
    variants: z
        .array(editProductVariantSchema)
        .min(1, "Minimal harus ada 1 data harga dan stok utama"),
});

export type UpdateProductFormValues = z.infer<typeof updateProductSchema>;
