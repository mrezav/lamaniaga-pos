"use server";

import { db } from "@/db";
import { stores, profiles, storeMembers } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import {
    createStorePayloadSchema,
    type CreateStorePayloadType,
} from "../schemas/store-schema";
/**
 * Checks if a store slug already exists in the database.
 */
export async function checkSlugExists(slug: string): Promise<boolean> {
    try {
        const store = await db.query.stores.findFirst({
            where: eq(stores.slug, slug),
        });
        return !!store;
    } catch (error) {
        console.error("Error checking slug existence:", error);
        return false;
    }
}

/**
 * Generates a unique slug from a store name, resolving collisions by appending a suffix.
 */
export async function generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    if (!baseSlug) return "";

    let slug = baseSlug;
    let counter = 1;
    let exists = await checkSlugExists(slug);

    while (exists) {
        const suffix = counter.toString().padStart(3, "0");
        slug = `${baseSlug}-${suffix}`;
        exists = await checkSlugExists(slug);
        counter++;
    }

    return slug;
}

type CreateStoreInput = CreateStorePayloadType;

/**
 * Atomic transaction to create a store and upgrade the owner's profile role and status.
 */
export async function createStoreTransaction(input: CreateStoreInput) {
    const validation = createStorePayloadSchema.safeParse(input);

    if (!validation.success) {
        return {
            data: null,
            error: "Input tidak valid : " + validation.error.format(),
        };
    }
    const validInput = validation.data;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");
        const ownerId = user.id;

        // 0. Check if user already has an active store ownership
        // const existingOwnership = await db.query.storeMembers.findFirst({
        //     where: and(
        //         eq(storeMembers.userId, ownerId),
        //         eq(storeMembers.role, "owner"),
        //     ),
        // });
        // if (existingOwnership) {
        //     throw new Error("Anda sudah memiliki sebuah toko");
        // }

        return await db.transaction(async (tx) => {
            // Set session variable 'request.jwt.claims' to simulate Supabase auth.uid()
            const jwtClaims = JSON.stringify({ sub: ownerId });
            await tx.execute(
                sql`SELECT set_config('request.jwt.claims', ${jwtClaims}, true)`,
            );

            // 1. Insert store
            const [newStore] = await tx
                .insert(stores)
                .values({
                    name: validInput.name,
                    slug: validInput.slug,
                    address: validInput.address || null,
                    phoneNumber: validInput.phoneNumber || null,
                    logoUrl: validInput.logoUrl || null,
                    bannerUrl: validInput.bannerUrl || null,
                })
                .returning({
                    id: stores.id,
                    slug: stores.slug,
                });

            if (!newStore) {
                throw new Error("Gagal membuat data toko");
            }

            // 2. Update profiles table
            await tx
                .update(profiles)
                .set({
                    lastActiveStoreId: newStore.id,
                })
                .where(eq(profiles.id, ownerId));

            // 3. Create store member relationship
            await tx.insert(storeMembers).values({
                userId: ownerId,
                storeId: newStore.id,
                role: "owner",
                status: "active",
            });

            return { data: newStore, error: null };
        });
    } catch (error: any) {
        console.dir(error, { depth: null });
        console.error("Transaction failed in createStoreTransaction:", error);

        const isUniqueViolation =
            error?.code === "23505" ||
            /duplicate key value violates unique constraint/i.test(
                error?.message ?? "",
            );

        return {
            data: null,
            error: isUniqueViolation
                ? "Slug sudah digunakan. Silakan ubah nama toko."
                : error?.message ||
                  "Terjadi kesalahan saat memproses data di server",
        };
    }
}

/**
 * Server Action to set the user's active storeId.
 */
/**
 * Server Action to set the user's active storeId.
 */
export async function setActiveStoreAction(storeId: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const store = await db.query.stores.findFirst({
            where: eq(stores.id, storeId),
        });

        if (!store) {
            return { success: false, error: "Toko tidak ditemukan" };
        }

        const memberRecord = await db.query.storeMembers.findFirst({
            where: and(
                eq(storeMembers.storeId, storeId),
                eq(storeMembers.userId, user.id),
                eq(storeMembers.status, "active"),
            ),
        });

        // const isOwner = store.ownerId === user.id;
        // const isStaff = !!memberRecord;

        // if (!isOwner && !isStaff) {
        //     return {
        //         success: false,
        //         error: "Anda bukan anggota toko ini",
        //     };
        // }

        await db
            .update(profiles)
            .set({ lastActiveStoreId: storeId })
            .where(eq(profiles.id, user.id));

        return { success: true };
    } catch (error: unknown) {
        const message =
            error instanceof Error
                ? error.message
                : "Gagal mengubah toko aktif";
        console.error("Failed to setActiveStoreAction:", error);
        return { success: false, error: message };
    }
}
