"use server"

import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm"

export async function getCategories(storeId: string, limit: number = 10, offset: number = 0) {
    try {
        const data = await db.select()
            .from(categories)
            .where(eq(categories.storeId, storeId))
            .limit(limit)
            .offset(offset);
        return { data, error: null };
    } catch (error) {
        console.error("Gagal mengambil kategori:", error);
        return { data: [], error: "Gagal mengambil data kategori" };
    }
}
