import { Button } from "@/components/ui/button";
import {
    PlusCircle,
    TrendingUp,
    ShoppingCart,
    Package,
    Layers,
    BarChart3,
    Calendar,
    ArrowUpRight,
    ShoppingBag,
    Settings,
    ReceiptIcon,
    UsersRound,
    Store,
} from "lucide-react";
import Link from "next/link";

export default async function StoreDashboardPage({
    params,
}: {
    params: Promise<{ storeSlug: string }>;
}) {
    const { storeSlug } = await params;

    // Definisikan item menu agar kode lebih bersih dan mudah dirawat
    const quickMenus = [
        {
            name: "Produk",
            description: "Kelola stok, harga, dan variasi barang Anda.",
            href: (slug: string) => `/stores/${slug}/products`,
            icon: ShoppingBag,
            color: "bg-blue-50 text-blue-600 border-blue-100/70",
            hoverColor: "group-hover:bg-blue-600 group-hover:text-white",
        },
        {
            name: "Kategori",
            description: "Kelompokkan produk agar mudah ditemukan.",
            href: (slug: string) => `/stores/${slug}/categories`,
            icon: Layers,
            color: "bg-amber-50 text-amber-600 border-amber-100/70",
            hoverColor: "group-hover:bg-amber-600 group-hover:text-white",
        },
        {
            name: "Riwayat Transaksi",
            description: "Temukan riwayat transaksi yang telah tercatat",
            href: (slug: string) => `/stores/${slug}/transactions`,
            icon: ReceiptIcon,
            color: "bg-emerald-50 text-emerald-600 border-emerald-100/70",
            hoverColor: "group-hover:bg-emerald-600 group-hover:text-white",
        },
        {
            name: "Member Toko",
            description: "Kelola keanggotaan di toko anda",
            href: (slug: string) => `/stores/${slug}/members`,
            icon: UsersRound,
            color: "bg-rose-50 text-rose-600 border-rose-100/70",
            hoverColor: "group-hover:bg-rose-600 group-hover:text-white",
        },

        {
            name: "Buka Kasir (POS)",
            description:
                "Mulai transaksi baru dengan pelanggan secara real-time.",
            href: (slug: string) => `/stores/${slug}/checkout`,
            icon: ShoppingCart,
            color: "bg-emerald-50 text-emerald-600 border-emerald-100/70",
            hoverColor: "group-hover:bg-emerald-600 group-hover:text-white",
        },
        {
            name: "Kelola Toko",
            description: "Ganti atau buat toko baru",
            href: (slug: string) => `/stores`,
            icon: Store,
            color: "bg-blue-50 text-blue-600 border-blue-100/70",
            hoverColor: "group-hover:bg-blue-600 group-hover:text-white",
        },
        {
            name: "Pengaturan Toko",
            description: "Sesuaikan profil toko, kurir, dan metode pembayaran.",
            href: (slug: string) => `/stores`,
            icon: Settings,
            color: "bg-slate-50 text-slate-600 border-slate-200/70",
            hoverColor: "group-hover:bg-slate-800 group-hover:text-white",
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 w-full">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-[#1E293B] p-8 rounded-3xl text-white border border-[#334155]/20 shadow-xl shadow-slate-900/5 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative space-y-2">
                    <h1 className="text-xl font-extrabold tracking-tight">
                        Selamat Datang Kembali!
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">
                        Kelola aktivitas harian, data transaksi, dan laporan
                        performa toko Anda dari sini.
                    </p>
                </div>
                <div className="relative shrink-0 flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 px-4 py-2.5 rounded-2xl text-xs font-mono text-slate-300">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span>
                        {new Date().toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </span>
                </div>
            </div>

            {/* KANAN: Grid Menu Utama (2 Kolom di Layar Lebar) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickMenus.map((menu, idx) => {
                    const IconComponent = menu.icon;
                    return (
                        <Link
                            key={idx}
                            href={menu.href(storeSlug)}
                            className="group block"
                        >
                            <div className="h-full bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group-hover:-translate-y-1">
                                {/* Efek Lingkaran Glow Halus saat Hover */}
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <div className="space-y-4 relative z-10">
                                    {/* Icon Wrapper */}
                                    <div
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm transition-all duration-300 ${menu.color} ${menu.hoverColor}`}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                    </div>

                                    {/* Teks Deskripsi */}
                                    <div className="space-y-1">
                                        <h4 className="font-extrabold text-slate-800 text-base tracking-tight flex items-center gap-1.5">
                                            {menu.name}
                                        </h4>
                                        <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                                            {menu.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Dashboard Empty Statistic Cards */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all flex items-center justify-between group">
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Total Penjualan
                        </span>
                        <p className="text-2xl font-black text-slate-800">
                            Rp 0
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">
                            Hari ini
                        </span>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all flex items-center justify-between group">
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Transaksi Kasir
                        </span>
                        <p className="text-2xl font-black text-slate-800">0</p>
                        <span className="text-[10px] text-slate-400 font-medium">
                            Berhasil diproses
                        </span>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all flex items-center justify-between group">
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Total Produk
                        </span>
                        <p className="text-2xl font-black text-slate-800">0</p>
                        <span className="text-[10px] text-slate-400 font-medium">
                            Aktif di katalog
                        </span>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                        <Package className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md shadow-slate-100/50 hover:shadow-lg transition-all flex items-center justify-between group">
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Stok Kritis
                        </span>
                        <p className="text-2xl font-black text-slate-800">0</p>
                        <span className="text-[10px] text-red-500 font-bold">
                            Perlu restok
                        </span>
                    </div>
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100 group-hover:scale-110 transition-transform">
                        <Layers className="w-6 h-6" />
                    </div>
                </div>
            </div> */}
        </div>
    );
}
