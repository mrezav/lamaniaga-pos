"use server"

import { db } from "@/db"
import { stores, profiles } from "@/db/schema"
import { eq, sql } from "drizzle-orm"

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
          storeId: newStore.id,
          role: "owner",
          status: "active",
        })
        .where(eq(profiles.id, input.ownerId))

      return { data: newStore, error: null }
    })
  } catch (error: any) {
    console.error("Transaction failed in createStoreTransaction:", error)
    return { data: null, error: error?.message || "Terjadi kesalahan saat memproses data di server" }
  }
}
