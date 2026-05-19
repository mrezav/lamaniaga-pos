"use server"

import { db } from "@/db"
import { stores, profiles, storeMembers } from "@/db/schema"
import { eq, sql, and } from "drizzle-orm"

/**
 * Checks if a store slug already exists in the database.
 */
export async function checkSlugExists(slug: string): Promise<boolean> {
  try {
    const store = await db.query.stores.findFirst({
      where: eq(stores.slug, slug),
    })
    return !!store
  } catch (error) {
    console.error("Error checking slug existence:", error)
    return false
  }
}

/**
 * Generates a unique slug from a store name, resolving collisions by appending a suffix.
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  if (!baseSlug) return ""

  let slug = baseSlug
  let counter = 1
  let exists = await checkSlugExists(slug)

  while (exists) {
    const suffix = counter.toString().padStart(3, "0")
    slug = `${baseSlug}-${suffix}`
    exists = await checkSlugExists(slug)
    counter++
  }

  return slug
}

interface CreateStoreInput {
  name: string
  slug: string
  address?: string
  phoneNumber?: string
  logoUrl?: string
  bannerUrl?: string
  ownerId: string
}

/**
 * Atomic transaction to create a store and upgrade the owner's profile role and status.
 */
export async function createStoreTransaction(input: CreateStoreInput) {
  try {
    return await db.transaction(async (tx) => {
      // 0. Check if user already has an active store ownership
      const existingOwnership = await tx.query.storeMembers.findFirst({
        where: and(
          eq(storeMembers.userId, input.ownerId),
          eq(storeMembers.role, "owner")
        ),
      })
      if (existingOwnership) {
        throw new Error("Anda sudah memiliki sebuah toko")
      }

      // Set session variable 'request.jwt.claims' to simulate Supabase auth.uid()
      const jwtClaims = JSON.stringify({ sub: input.ownerId })
      await tx.execute(
        sql`SELECT set_config('request.jwt.claims', ${jwtClaims}, true)`
      )

      // 1. Insert store
      const [newStore] = await tx
        .insert(stores)
        .values({
          name: input.name,
          slug: input.slug,
          address: input.address || null,
          phoneNumber: input.phoneNumber || null,
          logoUrl: input.logoUrl || null,
          bannerUrl: input.bannerUrl || null,
          ownerId: input.ownerId,
        })
        .returning({
          id: stores.id,
          slug: stores.slug,
        })

      if (!newStore) {
        throw new Error("Gagal membuat data toko")
      }

      // 2. Update profiles table
      await tx
        .update(profiles)
        .set({
          lastActiveStoreId: newStore.id,
        })
        .where(eq(profiles.id, input.ownerId))

      // 3. Create store member relationship
      await tx
        .insert(storeMembers)
        .values({
          userId: input.ownerId,
          storeId: newStore.id,
          role: "owner",
          status: "active",
        })

      return { data: newStore, error: null }
    })
  } catch (error: any) {
    console.error("Transaction failed in createStoreTransaction:", error)
    return { data: null, error: error?.message || "Terjadi kesalahan saat memproses data di server" }
  }
}

/**
 * Server Action to set the user's active storeId.
 */
export async function setActiveStoreAction(storeId: string, userId: string) {
  try {
    await db
      .update(profiles)
      .set({ lastActiveStoreId: storeId })
      .where(eq(profiles.id, userId))
    return { success: true }
  } catch (error: any) {
    console.error("Failed to setActiveStoreAction:", error)
    return { success: false, error: error?.message || "Gagal mengubah toko aktif" }
  }
}
