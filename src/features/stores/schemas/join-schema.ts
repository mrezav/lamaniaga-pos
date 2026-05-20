import { z } from "zod";

export const joinStoreSchema = z.object({
  joinCode: z.string()
    .min(9, "Kode toko harus terdiri dari 9 karakter")
    .max(9, "Kode toko harus terdiri dari 9 karakter")
    .regex(/^[a-zA-Z0-9]+$/, "Kode toko hanya boleh berisi huruf dan angka"),
});

export type JoinStoreInput = z.infer<typeof joinStoreSchema>;
