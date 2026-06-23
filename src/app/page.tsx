import Link from "next/link";
import {
    Store,
    Layers,
    Users,
    BarChart3,
    CheckCircle2,
    ArrowRight,
    ChevronDown,
    ShieldCheck,
    Zap,
    ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/10">
            {/* 1. NAVBAR */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                            <Store className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            OmniPOS
                        </span>
                    </div>

                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <a
                            href="#fitur"
                            className="transition-colors hover:text-foreground"
                        >
                            Fitur
                        </a>
                        <a
                            href="#solusi"
                            className="transition-colors hover:text-foreground"
                        >
                            Solusi Multi-Store
                        </a>
                        <a
                            href="#harga"
                            className="transition-colors hover:text-foreground"
                        >
                            Harga
                        </a>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/login">Masuk</Link>
                        </Button>
                        <Button size="sm" className="shadow-xs" asChild>
                            <Link href="/register">Mulai Gratis</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* 2. HERO SECTION */}
            <section className="relative overflow-hidden py-20 lg:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
                    {/* Badge Promo */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-6 animate-fade-in">
                        <Zap className="h-3 w-3" /> Manajemen Multi-Store Jadi
                        Lebih Mudah
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance bg-linear-to-b from-foreground to-foreground/70 bg-clip-text">
                        Satu Aplikasi Kasir untuk Kelola{" "}
                        <span className="text-primary">
                            Ratusan Cabang Toko
                        </span>{" "}
                        Anda
                    </h1>

                    <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
                        Pantau transaksi, kelola stok barang terpusat, dan atur
                        performa karyawan di seluruh cabang secara real-time
                        dari satu dashboard terpusat.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                        <Button
                            size="lg"
                            className="h-12 px-6 text-base group shadow-sm"
                            asChild
                        >
                            <Link href="/register">
                                Daftar Toko Anda Sekarang
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-12 px-6 text-base"
                            asChild
                        >
                            <Link href="/login">Coba Demo Akun</Link>
                        </Button>
                    </div>

                    {/* Mini Interactive Preview Mockup */}
                    <div className="mt-16 border border-border/60 bg-muted/30 p-4 rounded-2xl shadow-xl max-w-3xl mx-auto backdrop-blur-xs">
                        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-lg font-medium text-foreground shadow-xs">
                                <Store className="h-3.5 w-3.5 text-primary" />
                                <span>
                                    Pilih Outlet:{" "}
                                    <strong>Toko Cabang Bandung</strong>
                                </span>
                                <ChevronDown className="h-3 w-3 ml-1" />
                            </div>
                            <div className="flex gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                            </div>
                        </div>
                        {/* Representasi Visual Dashboard Ringkas */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                            <div className="p-4 bg-background rounded-xl border border-border/80 shadow-xs">
                                <span className="text-xs text-muted-foreground block mb-1">
                                    Total Pendapatan (Hari Ini)
                                </span>
                                <span className="text-lg font-bold">
                                    Rp 14.250.000
                                </span>
                            </div>
                            <div className="p-4 bg-background rounded-xl border border-border/80 shadow-xs">
                                <span className="text-xs text-muted-foreground block mb-1">
                                    Transaksi Berjalan
                                </span>
                                <span className="text-lg font-bold text-primary">
                                    182 Transaksi
                                </span>
                            </div>
                            <div className="p-4 bg-background rounded-xl border border-border/80 shadow-xs">
                                <span className="text-xs text-muted-foreground block mb-1">
                                    Stok Menipis (Semua Cabang)
                                </span>
                                <span className="text-lg font-bold text-destructive">
                                    4 Produk
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <hr className="border-border/40" />

            {/* 3. CORE FEATURES SECTION */}
            <section id="fitur" className="py-20 lg:py-32 bg-muted/20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Didesain Khusus untuk Bisnis Multi-Outlet
                        </h2>
                        <p className="mt-4 text-muted-foreground">
                            Semua fitur yang Anda butuhkan untuk mengontrol
                            operasional retail, F&B, atau franchise skala besar
                            tanpa perlu berpindah aplikasi.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Fitur 1 */}
                        <div className="p-6 bg-background rounded-xl border border-border/60 shadow-xs hover:border-primary/40 transition-colors">
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                                <Layers className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">
                                Arsitektur Multi-Tenant
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Data antar cabang terisolasi dengan aman, namun
                                tetap tersinkronisasi sempurna ke akun pusat
                                Anda.
                            </p>
                        </div>
                        {/* Fitur 2 */}
                        <div className="p-6 bg-background rounded-xl border border-border/60 shadow-xs hover:border-primary/40 transition-colors">
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">
                                Stok Terpusat
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Pantau mutasi barang antar gudang dan cabang.
                                Hindari kehabisan stok barang terlaris Anda.
                            </p>
                        </div>
                        {/* Fitur 3 */}
                        <div className="p-6 bg-background rounded-xl border border-border/60 shadow-xs hover:border-primary/40 transition-colors">
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                                <Users className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">
                                Hak Akses Karyawan
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Atur izin akses khusus untuk kasir, manajer
                                outlet, hingga admin logistik demi mencegah
                                kecurangan.
                            </p>
                        </div>
                        {/* Fitur 4 */}
                        <div className="p-6 bg-background rounded-xl border border-border/60 shadow-xs hover:border-primary/40 transition-colors">
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">
                                Analisis Konsolidasian
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Bandingkan performa penjualan antar outlet
                                secara instan untuk menentukan strategi promo
                                terbaik.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. PRICING SECTION */}
            <section id="harga" className="py-20 lg:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Skema Harga Transparan
                        </h2>
                        <p className="mt-4 text-muted-foreground">
                            Mulai gratis untuk toko pertama Anda, tingkatkan
                            kapasitas seiring berkembangnya cabang baru.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Paket Starter */}
                        <div className="p-8 bg-background border border-border/60 rounded-2xl flex flex-col justify-between shadow-xs">
                            <div>
                                <h3 className="font-bold text-xl mb-1">
                                    Starter
                                </h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Cocok untuk UMKM rintisan baru.
                                </p>
                                <div className="mb-6">
                                    <span className="text-4xl font-extrabold">
                                        Rp 0
                                    </span>
                                    <span className="text-muted-foreground text-sm">
                                        {" "}
                                        /selamanya
                                    </span>
                                </div>
                                <ul className="space-y-3 text-sm mb-8">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />{" "}
                                        1 Outlet / Toko
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />{" "}
                                        Maks. 100 Produk
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />{" "}
                                        Laporan Penjualan Standar
                                    </li>
                                </ul>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                asChild
                            >
                                <Link href="/register">Mulai Gratis</Link>
                            </Button>
                        </div>

                        {/* Paket Pro */}
                        <div className="p-8 bg-background border-2 border-primary rounded-2xl flex flex-col justify-between shadow-md relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-semibold tracking-wider uppercase">
                                Paling Populer
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-1">
                                    Business Grow
                                </h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Untuk bisnis dengan rencana ekspansi cabang.
                                </p>
                                <div className="mb-6">
                                    <span className="text-4xl font-extrabold">
                                        Rp 299k
                                    </span>
                                    <span className="text-muted-foreground text-sm">
                                        {" "}
                                        /bulan
                                    </span>
                                </div>
                                <ul className="space-y-3 text-sm mb-8">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />{" "}
                                        Hingga 5 Outlet Cabang
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />{" "}
                                        Produk Tidak Terbatas
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />{" "}
                                        Manajemen Karyawan Pro
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />{" "}
                                        Sinkronisasi Stok Real-time
                                    </li>
                                </ul>
                            </div>
                            <Button className="w-full shadow-xs" asChild>
                                <Link href="/register">Daftar Sekarang</Link>
                            </Button>
                        </div>

                        {/* Paket Enterprise */}
                        <div className="p-8 bg-background border border-border/60 rounded-2xl flex flex-col justify-between shadow-xs">
                            <div>
                                <h3 className="font-bold text-xl mb-1">
                                    Franchise / Enterprise
                                </h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Solusi untuk jaringan retail skala nasional.
                                </p>
                                <div className="mb-6">
                                    <span className="text-4xl font-extrabold">
                                        Hubungi Kami
                                    </span>
                                </div>
                                <ul className="space-y-3 text-sm mb-8">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />{" "}
                                        Unlimited Outlet & Cabang
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />{" "}
                                        Dedicated Database Support
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />{" "}
                                        API Kustom & Integrasi ERP
                                    </li>
                                </ul>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                asChild
                            >
                                <Link href="/login">Hubungi Sales</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. CTA BOTTOM */}
            <section className="bg-primary text-primary-foreground py-16 lg:py-24 text-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Siap Memegang Kontrol Penuh Atas Bisnis Anda?
                    </h2>
                    <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                        Bergabunglah dengan ribuan pemilik usaha yang berhasil
                        mendongkrak efisiensi operasional toko mereka hingga
                        200%.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button
                            size="lg"
                            variant="secondary"
                            className="h-12 px-6 text-base text-primary font-semibold"
                            asChild
                        >
                            <Link href="/register">
                                Buat Akun Sekarang (Gratis)
                            </Link>
                        </Button>
                    </div>
                    <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-primary-foreground/70">
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4" /> Tanpa Kartu
                            Kredit
                        </span>
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4" /> Setup Kurang
                            dari 5 Menit
                        </span>
                    </div>
                </div>
            </section>

            {/* 6. FOOTER */}
            <footer className="border-t border-border/40 py-8 bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
                    <p>
                        © {new Date().getFullYear()} OmniPOS. Hak Cipta
                        Dilindungi Undang-Undang.
                    </p>
                    <div className="flex gap-6">
                        <a
                            href="#"
                            className="hover:text-foreground transition-colors"
                        >
                            Syarat & Ketentuan
                        </a>
                        <a
                            href="#"
                            className="hover:text-foreground transition-colors"
                        >
                            Kebijakan Privasi
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
