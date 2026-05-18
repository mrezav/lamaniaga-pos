import { z } from "zod"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]

export const createStoreSchema = z.object({
  name: z.string()
    .min(3, "Nama toko minimal 3 karakter")
    .max(100, "Nama toko maksimal 100 karakter"),
  slug: z.string()
    .min(3, "Slug minimal 3 karakter")
    .max(100, "Slug maksimal 100 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung"),
  address: z.string().max(500, "Alamat maksimal 500 karakter").optional().or(z.literal("")),
  phoneNumber: z.string()
    .max(20, "Nomor telepon maksimal 20 karakter")
    .refine((val) => !val || /^[0-9+\s-]+$/.test(val), "Nomor telepon tidak valid")
    .optional()
    .or(z.literal("")),
  logo: z.any()
    .refine((file) => !file || (file instanceof File && file.size <= MAX_FILE_SIZE), "Ukuran logo maksimal 5MB.")
    .refine(
      (file) => !file || (file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type)),
      "Format logo harus JPEG, PNG, WEBP, atau SVG."
    )
    .optional(),
  banner: z.any()
    .refine((file) => !file || (file instanceof File && file.size <= MAX_FILE_SIZE), "Ukuran banner maksimal 5MB.")
    .refine(
      (file) => !file || (file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type)),
      "Format banner harus JPEG, PNG, WEBP, atau SVG."
    )
    .optional(),
})

export type CreateStoreSchemaType = z.infer<typeof createStoreSchema>
