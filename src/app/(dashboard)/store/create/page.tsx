import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StoreForm } from "@/features/stores/components/StoreForm"
import { Store, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { db } from "@/db"
import { profiles } from "@/db/schema"
import { eq } from "drizzle-orm"
import { OnboardingHeader } from "@/components/shared/OnboardingHeader"

export default async function CreateStorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Page Guard: If user already has a store, redirect to dashboard
  const userProfile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id)
  })

  if (userProfile?.storeId) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <OnboardingHeader />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-4xl space-y-6">
          {/* Navigation back link */}
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm group"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Kembali ke Dashboard
            </Link>
          </div>

          {/* Form Container Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100/80 overflow-hidden">
            {/* Decorative Top header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-8 py-10 text-white overflow-hidden">
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-black/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="relative flex items-center gap-4">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight">Mulai Bisnis Anda</h1>
                  <p className="text-blue-100/90 text-sm mt-1 font-medium">
                    Lengkapi formulir di bawah ini untuk mendirikan toko POS modern Anda.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content body */}
            <div className="p-8">
              <StoreForm userId={user.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
