"use server"

import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";

export async function getCategories() {
    try {
        const data = await db.select().from(categories);
        return { data, error: null };
    } catch (error) {
        console.error("Gagal mengambil kategori:", error);
        return { data: [], error: "Gagal mengambil data kategori" };
    }
}
