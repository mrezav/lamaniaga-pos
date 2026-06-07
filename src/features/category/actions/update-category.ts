"use server";

import { getStoreContext } from "@/lib/action-guards";
import { CategoryInput, categorySchema } from "../schemas/category-schema";
import { checkPermission } from "@/lib/permission";
import { updateCategory } from "../repositories/update";
import { revalidatePath } from "next/cache";

export async function updateCategoryAction(
    categoryId: string,
    storeSlug: string,
    input: CategoryInput,
) {
    try {
        const store = await getStoreContext(storeSlug);
        await checkPermission(store.id, "category", "edit");
        const validatedFields = categorySchema.safeParse(input);
        if (!validatedFields.success) {
            return {
                success: false,
                validationErrors: validatedFields.error.flatten().fieldErrors,
            };
        }
        const updated = await updateCategory(
            categoryId,
            store.id,
            validatedFields.data,
        );

        if (!updated) {
            return { success: false, error: "Kategori tidak ditemukan." };
        }

        revalidatePath(`store/${storeSlug}/categories`);

        return { success: true, data: updated };
    } catch (error) {
        console.error("Error update category:", error);

        const errorMessage =
            error instanceof Error
                ? error.message
                : String(error) || "Gagal membuat kategori, silakan coba lagi.";

        return {
            success: false,
            message: errorMessage,
        };
    }
}
