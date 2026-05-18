import { createClient } from "@/lib/supabase/server"
import { db } from "@/db"
import { profiles, stores } from "@/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { StoreLayoutClient } from "./components/StoreLayoutClient"

interface StoreLayoutProps {
  children: React.ReactNode
  params: Promise<{ storeSlug: string }>
}

export default async function StoreLayout({ children, params }: StoreLayoutProps) {
  const { storeSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const userProfile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  })

  if (!userProfile) {
    redirect("/dashboard")
  }

  // Fetch the current store by slug
  const store = await db.query.stores.findFirst({
    where: eq(stores.slug, storeSlug),
  })

  if (!store) {
    redirect("/dashboard")
  }

  // Multi-Tenant Security Authorization Guard
  const isOwner = store.ownerId === user.id
  const isStaff = userProfile.storeId === store.id && userProfile.status === "active"
  const isAllowed = isOwner || isStaff

  if (!isAllowed) {
    redirect("/dashboard")
  }

  // Self-Healing Sync: Ensure active profile storeId matches the current tenant slug URL
  if (userProfile.storeId !== store.id) {
    await db
      .update(profiles)
      .set({ storeId: store.id })
      .where(eq(profiles.id, user.id))
    userProfile.storeId = store.id
  }

  return (
    <StoreLayoutClient store={store} profile={userProfile}>
      {children}
    </StoreLayoutClient>
  )
}
