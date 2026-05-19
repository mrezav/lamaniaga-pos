import { Button } from "@/components/ui/button"
import { PlusCircle, Users } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/db"
import { profiles, stores, storeMembers } from "@/db/schema"
import { eq, and, inArray } from "drizzle-orm"
import { redirect } from "next/navigation"
import { OnboardingHeader } from "@/components/shared/OnboardingHeader"
import { StoreSelector } from "./components/StoreSelector"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch the user's profile
  const userProfile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  })

  // Query stores owned by the user
  const ownedStores = await db.query.stores.findMany({
    where: eq(stores.ownerId, user.id),
  })

  // Query stores the user works at via the storeMembers table using a single JOIN query
  const joinedStores = await db
    .select({
      store: stores,
    })
    .from(stores)
    .innerJoin(storeMembers, eq(stores.id, storeMembers.storeId))
    .where(
      and(
        eq(storeMembers.userId, user.id),
        eq(storeMembers.status, "active")
      )
    )

  const memberStores = joinedStores.map((js) => js.store)

  // Combine them uniquely by store ID
  const storeMap = new Map<string, any>()
  ownedStores.forEach((s) => storeMap.set(s.id, s))
  memberStores.forEach((s) => storeMap.set(s.id, s))

  const allStores = Array.from(storeMap.values())

  // --- SCENARIO A: 0 Stores (Render beautiful onboarding screen) ---
  if (allStores.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <OnboardingHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-4xl w-full space-y-8 py-12">
            <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Selamat Datang!</h1>
              <p className="text-slate-500 text-lg">Mulai langkah Anda untuk mengelola toko dengan lebih mudah</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              {/* Section 1: Buat Toko Baru */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-6 hover:shadow-lg transition-all duration-300 group animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <PlusCircle className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">Buat Toko Baru</h2>
                  <p className="text-slate-500 leading-relaxed">Mulai dari awal dan kelola produk, transaksi, dan stok Anda sendiri.</p>
                </div>
                <Link href="/store/create" className="w-full">
                  <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all">
                    Buat Toko Sekarang
                  </Button>
                </Link>
              </div>

              {/* Section 2: Bergabung dengan Toko */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-6 hover:shadow-lg transition-all duration-300 group animate-in fade-in slide-in-from-right-4 duration-700">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-12 h-12" />
                </div>
                <div className="space-y-2 w-full">
                  <h2 className="text-2xl font-bold text-slate-900">Gabung Toko</h2>
                  <p className="text-slate-500 leading-relaxed">Gunakan kode akses untuk bergabung dengan toko yang sudah ada.</p>
                </div>
                <div className="w-full space-y-4">
                  <input
                    type="text"
                    className="w-full px-4 h-14 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-slate-50/50 text-center font-mono text-lg tracking-widest uppercase"
                    placeholder="KODE-TOKO"
                  />
                  <Button variant="secondary" className="w-full h-14 text-lg font-bold rounded-2xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none transition-colors">
                    Bergabung
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // --- SCENARIO B: Tepat 1 Toko (Auto-redirect langsung ke workspace toko) ---
  if (allStores.length === 1) {
    const singleStore = allStores[0]
    // Self-healing: Sync profile lastActiveStoreId with this single store if out of sync
    if (userProfile && userProfile.lastActiveStoreId !== singleStore.id) {
      await db
        .update(profiles)
        .set({ lastActiveStoreId: singleStore.id })
        .where(eq(profiles.id, user.id))
    }
    redirect(`/${singleStore.slug}`)
  }

  // --- SCENARIO C: >= 2 Toko (Render premium Store Selector) ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <OnboardingHeader />
      <main className="flex-1 flex items-center justify-center">
        <StoreSelector stores={allStores} userId={user.id} />
      </main>
    </div>
  )
}
