import { findBySlug } from "@/features/stores/repositories";
import { cache } from "react";

export const getStoreContext = cache(async (storeSlug: string) => {
    if (!storeSlug) {
        throw new Error("Slug toko tidak valid atau kosong");
    }

    const store = await findBySlug(storeSlug);
    if (!store) {
        throw new Error("Toko tidak ditemukan");
    }
    return store;
});
