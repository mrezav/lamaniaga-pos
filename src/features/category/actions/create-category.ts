"use server";

import { getStoreBySlug } from "@/features/stores/repositories";
import { checkPermission } from "@/lib/permission";
import { createCategory } from "../repositories/create-category";
import { createCategorySchema } from "../schemas/category-schema";

const generateSlug = (name: string) => {
    return name
        .toLocaleLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // Ganti spasi/simbol dengan dash
        .replace(/(^-|-$)+/g, ""); // Hapus dash di awal/akhir
};
export async function createCategoryAction(storeSlug: string, values: unknown) {
    try {
        // 1. Ambil data toko berdasarkan slug
        const store = await getStoreBySlug(storeSlug);
        if (!store) {
            return { success: false, message: "Toko tidak ditemukan." };
        }

        const storeId = store.id;

        // 2. Amankan dengan guard menggunakan storeId asli
        // Jika user tidak punya akses (misal: Cashier), guard melempar error dan langsung lompat ke catch
        await checkPermission(storeId, "category", "create");

        // 3. Validasi field data input menggunakan Zod
        const validatedFields = createCategorySchema.safeParse(values);

        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.flatten().fieldErrors,
            };
        }

        const { name, slug, description } = validatedFields.data;
        const finalSlug =
            slug && slug.trim() !== ""
                ? generateSlug(slug)
                : generateSlug(name);

        // 4. Insert data ke database
        await createCategory({
            name,
            description: description ?? null,
            slug: finalSlug,
            storeId: storeId,
        });

        // 5. Revalidasi cache dashboard toko
        // revalidatePath(`/dashboard/${storeId}/categories`);

        return { success: true, error: null };
    } catch (error: unknown) {
        console.error("Error create category:", error);

        // 6. Menangkap pesan error murni dari lib/guard untuk ditampilkan di UI
        const message =
            error instanceof Error
                ? error.message
                : String(error) || "Gagal membuat kategori, silakan coba lagi.";

        return {
            success: false,
            error: message,
        };
    }
}
