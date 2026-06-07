export interface getCategoriesParams {
    storeId: string;
    storeSlug: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: "name" | "createdAt";
    sortOrder?: "asc" | "desc";
}

// src/features/category/types/category.ts
import { categories } from "@/db/schema/categories"; // Sesuaikan dengan path schema Drizzle Anda

/**
 * Tipe data objek Category utuh yang keluar dari database (Drizzle Select).
 * Object ini yang nantinya akan berisi: id, storeId, name, description, createdAt, dll.
 */
export type Category = typeof categories.$inferSelect;
