import { Button } from "@/components/ui/button"
import {
  PlusCircle,
  Users,
  TrendingUp,
  ShoppingCart,
  Package,
  Layers,
  BarChart3,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/db"
import { profiles } from "@/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const userProfile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  })

  const hasStore = !!userProfile?.storeId

  // --- SCENARIO 1: User ALREADY has a Store (Render premium POS Dashboard Layout content) ---
  if (hasStore) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-[#1E293B] p-8 rounded-3xl text-white border border-[#334155]/20 shadow-xl shadow-slate-900/5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Selamat Datang Kembali!</h1>
            <p className="text-slate-400 text-sm font-medium">
              Kelola aktivitas harian, data transaksi, dan laporan performa toko Anda dari sini.
            </p>
          </div>
          <div className="relative shrink-0 flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 px-4 py-2.5 rounded-2xl text-xs font-mono text-slate-300">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>{new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Dashboard Empty Statistic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Sales */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all flex items-center justify-between group">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Penjualan</span>
              <p className="text-2xl font-black text-slate-800">Rp 0</p>
              <span className="text-[10px] text-slate-400 font-medium">Hari ini</span>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Total Transactions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all flex items-center justify-between group">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transaksi Kasir</span>
              <p className="text-2xl font-black text-slate-800">0</p>
              <span className="text-[10px] text-slate-400 font-medium">Berhasil diproses</span>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Products Active */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all flex items-center justify-between group">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Produk</span>
              <p className="text-2xl font-black text-slate-800">0</p>
              <span className="text-[10px] text-slate-400 font-medium">Aktif di katalog</span>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Inventory Alert */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all flex items-center justify-between group">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stok Kritis</span>
              <p className="text-2xl font-black text-slate-800">0</p>
              <span className="text-[10px] text-red-500 font-bold">Perlu restok</span>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Large Layout Content Box: Beautiful Blank State Graphic */}
        <div className="bg-white p-12 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col items-center justify-center min-h-[420px] text-center space-y-6">
          <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center border border-blue-100/50 shadow-inner">
            <BarChart3 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Belum Ada Aktivitas Penjualan</h3>
            <p className="text-slate-500 max-w-md mx-auto text-sm font-medium leading-relaxed">
              Mulai masukkan produk pertama Anda di menu **Product**, atau lakukan transaksi di POS kasir untuk melihat ringkasan statistik performa di sini.
            </p>
          </div>
          <div className="pt-2 flex gap-4">
            <Link href="/dashboard/products">
              <Button className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-100 transition-all flex items-center gap-2 text-xs">
                <PlusCircle className="w-4 h-4" />
                Tambah Produk
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // --- SCENARIO 2: User DOES NOT have a Store (Render onboarding view to let them create/join) ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 flex items-center justify-center">
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
    </div>
  )
}
