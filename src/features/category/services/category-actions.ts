"use server";

import { db } from "@/db";
import { categorySchema } from "../schemas/category-schema";
import { categories } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { getStoreBySlug } from "@/lib/store";
import { checkPermission } from "@/lib/permission";
import { UserAction } from "@/types";

const generateSlug = (name: string) => {
    return name
        .toLocaleLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // Ganti spasi/simbol dengan dash
        .replace(/(^-|-$)+/g, ""); // Hapus dash di awal/akhir
};
export async function createCategory(storeSlug: string, values: unknown) {
    try {
        // 1. Ambil data toko berdasarkan slug
        const store = await getStoreBySlug(storeSlug);
        if (!store) {
            return { success: false, message: "Toko tidak ditemukan." };
        }

        const storeId = store.id;

        checkPermission(store.id, "category", UserAction.CREATE);

        // 3. Validasi field data input menggunakan Zod
        const validatedFields = categorySchema.safeParse(values);
        if (!validatedFields.success) {
            return { success: false, message: "Kolom tidak valid!" };
        }

        const { name, description } = validatedFields.data;
        const slug = generateSlug(name);

        // 4. Insert data ke database
        await db.insert(categories).values({
            name,
            slug,
            description,
            storeId,
        });

        // 5. Revalidasi cache dashboard toko
        revalidatePath(`/dashboard/${storeId}/categories`);

        return { success: true, message: "Kategori berhasil dibuat!" };
    } catch (error: unknown) {
        console.error("Error create category:", error);

        // 6. Menangkap pesan error murni dari lib/guard untuk ditampilkan di UI
        const message =
            error instanceof Error
                ? error.message
                : String(error) || "Gagal membuat kategori, silakan coba lagi.";

        return {
            success: false,
            message,
        };
    }
}
