"use server"

import { db } from "@/db"
import { stores, storeMembers, profiles } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { randomInt } from "node:crypto"
import { createClient } from "@/lib/supabase/server"

// Helper function to generate a secure random 9-digit alphanumeric code
function generateRandomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(randomInt(0, chars.length))
  }
  return result
}

/**
 * Generates a unique 9-digit join code for a store and updates the database.
 */
export async function generateJoinCodeAction(storeId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const store = await db.query.stores.findFirst({
      where: eq(stores.id, storeId),
    })

    if (!store || store.ownerId !== user.id) {
      return { success: false, error: "Anda tidak memiliki akses untuk aksi ini." }
    }

    let joinCode = ""
    let isUnique = false
    let attempts = 0

    // Ensure the generated code is unique in the stores table
    while (!isUnique && attempts < 10) {
      joinCode = generateRandomCode()
      const existing = await db.query.stores.findFirst({
        where: eq(stores.joinCode, joinCode),
      })
      if (!existing) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      throw new Error("Gagal membuat kode unik setelah beberapa percobaan. Silakan coba lagi.")
    }

    // Update the store's join code
    await db
      .update(stores)
      .set({ joinCode })
      .where(eq(stores.id, storeId))

    return { success: true, joinCode }
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal membuat kode toko baru." }
  }
}

/**
 * Handles a user's request to join a store using a 9-digit code.
 */
export async function submitJoinCodeAction(joinCode: string, userId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return { success: false, error: "Unauthorized" }
    }

    const formattedCode = joinCode.trim().toUpperCase()

    // 1. Find store by join code
    const store = await db.query.stores.findFirst({
      where: eq(stores.joinCode, formattedCode),
    })

    if (!store) {
      return { success: false, error: "Toko tidak ditemukan. Pastikan kode yang dimasukkan sudah benar." }
    }

    // 2. Check if the user is the owner of the store
    if (store.ownerId === userId) {
      return { success: false, error: "Anda adalah pemilik toko ini. Tidak perlu bergabung sebagai staf." }
    }

    // 3. Check if the user is already a member (pending, active, or rejected)
    const existingMember = await db.query.storeMembers.findFirst({
      where: and(
        eq(storeMembers.storeId, store.id),
        eq(storeMembers.userId, userId)
      ),
    })

    if (existingMember) {
      if (existingMember.status === "active") {
        return { success: false, error: "Anda sudah terdaftar sebagai staf aktif di toko ini." }
      }
      if (existingMember.status === "pending") {
        return { success: false, error: "Permintaan Anda sebelumnya masih berstatus pending. Harap menunggu persetujuan." }
      }
      // If rejected, we allow them to re-apply by updating status to pending
      await db
        .update(storeMembers)
        .set({ status: "pending", updatedAt: new Date().toISOString() })
        .where(eq(storeMembers.id, existingMember.id))
      
      return { success: true }
    }

    // 4. Create new pending membership row
    await db.insert(storeMembers).values({
      userId,
      storeId: store.id,
      role: "cashier",
      status: "pending",
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengirimkan permintaan gabung." }
  }
}

/**
 * Fetches the list of members for a specific store, including their profile information.
 */
export async function getStoreMembersAction(storeId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const store = await db.query.stores.findFirst({
      where: eq(stores.id, storeId),
    })

    if (!store || store.ownerId !== user.id) {
      return { success: false, error: "Anda tidak memiliki akses untuk aksi ini." }
    }

    const members = await db
      .select({
        id: storeMembers.id,
        userId: storeMembers.userId,
        role: storeMembers.role,
        status: storeMembers.status,
        createdAt: storeMembers.createdAt,
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
      })
      .from(storeMembers)
      .innerJoin(profiles, eq(storeMembers.userId, profiles.id))
      .where(eq(storeMembers.storeId, storeId))
      .orderBy(storeMembers.createdAt)

    return { success: true, data: members }
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengambil data staf." }
  }
}

/**
 * Updates the approval status of a store member (Approve/Reject).
 */
export async function updateMemberStatusAction(memberId: string, status: "active" | "rejected") {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const member = await db.query.storeMembers.findFirst({
      where: eq(storeMembers.id, memberId),
    })

    if (!member) {
      return { success: false, error: "Anggota tidak ditemukan." }
    }

    const store = await db.query.stores.findFirst({
      where: eq(stores.id, member.storeId),
    })

    if (!store || store.ownerId !== user.id) {
      return { success: false, error: "Anda tidak memiliki akses untuk aksi ini." }
    }

    await db
      .update(storeMembers)
      .set({
        status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(storeMembers.id, memberId))

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui status keanggotaan." }
  }
}
