import { createClient } from "@/lib/supabase/server"
import { db } from "@/db"
import { profiles, stores } from "@/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { DashboardLayoutClient } from "./components/DashboardLayoutClient"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const userProfile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  })

  // If user is not associated with a store, render plain child onboarding flow
  if (!userProfile?.storeId) {
    return <>{children}</>
  }

  // Fetch registered store details
  const store = await db.query.stores.findFirst({
    where: eq(stores.id, userProfile.storeId),
  })

  if (!store) {
    return <>{children}</>
  }

  // Render premium POS sidebar/topbar layout with store branding
  return (
    <DashboardLayoutClient store={store} profile={userProfile}>
      {children}
    </DashboardLayoutClient>
  )
}
