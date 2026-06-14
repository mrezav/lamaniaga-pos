import { findStoreBySlug } from "@/features/stores/repositories";
import { cache } from "react";

/**
 * Mengambil data toko berdasarkan slug dengan optimasi Request Memoization.
 * Aman dipanggil berulang kali di berbagai Server Components/Actions
 * dalam satu siklus request tanpa menduplikasi query ke database.
 */
export const getStoreBySlug = cache(async (storeSlug: string) => {
    if (!storeSlug) {
        throw new Error("Slug toko tidak valid atau kosong");
    }

    const store = await findStoreBySlug(storeSlug);
    if (!store) {
        throw new Error("Toko tidak ditemukan");
    }
    return store;
});
