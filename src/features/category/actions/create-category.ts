"use server";

import { checkPermission } from "@/lib/permission";
import { createCategory } from "../repositories/create";
import { generateCategorySlug } from "../utils/generate-slug";
import { categorySchema } from "../schemas/category-schema";
import { revalidatePath } from "next/cache";
import { getStoreBySlug } from "@/lib/store";
import { UserAction } from "@/types";

export async function createCategoryAction(storeSlug: string, values: unknown) {
    try {
        // 1. Ambil data toko berdasarkan slug
        const store = await getStoreBySlug(storeSlug);
        if (!store) {
            return { success: false, error: "Toko tidak ditemukan." };
        }

        const storeId = store.id;

        // 2. Amankan dengan guard menggunakan storeId asli
        // Jika user tidak punya akses (misal: Cashier), guard melempar error dan langsung lompat ke catch
        await checkPermission(storeId, "category", UserAction.CREATE);

        // 3. Validasi field data input menggunakan Zod
        const validatedFields = categorySchema.safeParse(values);

        if (!validatedFields.success) {
            return {
                success: false,
                validationErrors: validatedFields.error.flatten().fieldErrors,
            };
        }

        const { name, description } = validatedFields.data;
        const finalSlug = await generateCategorySlug(name, storeId);

        // 4. Insert data ke database
        await createCategory({
            name,
            description: description ?? null,
            slug: finalSlug,
            storeId: storeId,
        });

        // 5. Revalidasi cache dashboard toko
        revalidatePath(`/dashboard/${storeId}/categories`);

        return { success: true };
    } catch (error: unknown) {
        console.error("Error create category:", error);

        // 6. Menangkap pesan error murni dari lib/guard untuk ditampilkan di UI
        const errorMessage =
            error instanceof Error
                ? error.message
                : String(error) || "Gagal membuat kategori, silakan coba lagi.";

        return {
            success: false,
            error: errorMessage,
        };
    }
}
