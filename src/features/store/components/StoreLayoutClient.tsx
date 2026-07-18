"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/state/useToastStore";
import {
    LayoutDashboard,
    Boxes,
    LogOut,
    User,
    UsersRound,
    PackageIcon,
    SwitchCamera,
    ShoppingCart,
    ReceiptIcon,
    Menu,
} from "lucide-react";
import { ProfileRow, StoreMemberRow, StoreRow } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "./SidebarContent";

interface StoreLayoutClientProps {
    children: React.ReactNode;
    store: StoreRow;
    profile: ProfileRow;
    storeMember: StoreMemberRow;
}

export function StoreLayoutClient({
    children,
    store,
    profile,
    storeMember,
}: StoreLayoutClientProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const { showToast } = useToastStore();

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const copyStoreCode = async () => {
        if (store.joinCode) {
            await navigator.clipboard.writeText(store.joinCode);
            setIsCopied(true);
            showToast("Kode toko berhasil disalin!", "success");
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const menuItems = [
        {
            name: "Dashboard",
            href: `/stores/${store.slug}/dashboard`,
            icon: LayoutDashboard,
        },
        {
            name: "Kasir",
            href: `/stores/${store.slug}/checkout`,
            icon: ShoppingCart,
        },
        {
            name: "Kategori",
            href: `/stores/${store.slug}/categories`,
            icon: Boxes,
        },
        {
            name: "Produk",
            href: `/stores/${store.slug}/products`,
            icon: PackageIcon,
        },
        {
            name: "Transaksi",
            href: `/stores/${store.slug}/transactions`,
            icon: ReceiptIcon,
        },
    ];

    if (storeMember && storeMember?.role == "owner") {
        menuItems.push({
            name: "Member Toko",
            href: `/stores/${store.slug}/members`,
            icon: UsersRound,
        });
    }

    const routeLabels: Record<string, string> = {
        dashboard: "Ringkasan Toko",
        checkout: "Checkout",
        categories: "Kategori",
        products: "Produk",
        members: "Member Toko",
        transactions: "Transaksi",
        create: "Buat Data",
        edit: "Ubah Data",
    };
    const currentPage = pathname.split("/").pop() || "";
    const title = routeLabels[currentPage] || currentPage;

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            showToast("Berhasil keluar dari akun.", "success");
            router.push("/login");
            router.refresh();
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Gagal melakukan logout";
            showToast(message, "error");
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans w-full relative">
            {/* 1. Desktop Sidebar Navigation */}
            {/* Menambahkan utility 'hidden md:flex' agar hilang total di layar HP */}
            <aside
                className={`fixed inset-y-0 left-0 z-20 hidden md:flex flex-col h-full bg-[#0F172A] border-r border-[#1E293B] transition-all duration-300 ${
                    isSidebarCollapsed ? "w-20" : "w-64"
                }`}
            >
                <SidebarContent
                    isSidebarCollapsed={isSidebarCollapsed}
                    setIsSidebarCollapsed={setIsSidebarCollapsed}
                    store={store}
                    storeMember={storeMember}
                    menuItems={menuItems}
                    pathname={pathname}
                    copyStoreCode={copyStoreCode}
                    isCopied={isCopied}
                />
            </aside>

            {/* 2. Main Area: Topbar and Content Wrapper */}
            {/* Mengubah padding kiri agar dinamis: 'pl-0' di mobile, dan menyesuaikan lebar sidebar di desktop ('md:pl-20' / 'md:pl-64') */}
            <div
                className={`flex flex-col flex-1 h-full overflow-hidden transition-all duration-300 pl-0 ${
                    isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
                }`}
            >
                {/* Topbar/Header */}
                {/* Mengubah padding horisontal 'px-4 md:px-8' agar pas untuk layar kecil */}
                <header className="flex items-center justify-between h-20 px-4 md:px-8 bg-white border-b border-slate-200 shrink-0">
                    {/* Bagian Kiri Topbar: Tombol Hamburger Mobile + Judul Halaman */}
                    <div className="flex items-center gap-4">
                        {/* Hamburger Button menggunakan Shadcn UI Sheet */}
                        {/* Otomatis hanya dirender/muncul di layar HP (< md) */}
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <button className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
                                        <Menu className="w-6 h-6" />
                                    </button>
                                </SheetTrigger>
                                {/* SheetContent di-set p-0 dan bg-[#0F172A] agar matching dengan tema sidebar asli */}
                                <SheetContent
                                    side="left"
                                    className="p-0 w-64 bg-[#0F172A] border-r border-[#1E293B]"
                                >
                                    {/* Di mobile view, paksa prop `isSidebarCollapsed` selalu bernilai false */}
                                    <SidebarContent
                                        isSidebarCollapsed={false}
                                        setIsSidebarCollapsed={() => {}}
                                        store={store}
                                        storeMember={storeMember}
                                        menuItems={menuItems}
                                        pathname={pathname}
                                        copyStoreCode={copyStoreCode}
                                        isCopied={isCopied}
                                    />
                                </SheetContent>
                            </Sheet>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-slate-800 capitalize tracking-tight truncate max-w-[180px] sm:max-w-none">
                                {title}
                            </h2>
                        </div>
                    </div>

                    {/* Bagian Kanan Topbar: Profil Dropdown */}
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setIsUserMenuOpen(!isUserMenuOpen)
                                }
                                className="flex items-center gap-2 md:gap-3 p-1.5 pr-2 md:pr-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                            >
                                <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-xl bg-blue-50 text-blue-600 font-black shrink-0 border border-blue-100">
                                    {profile.avatarUrl ? (
                                        <img
                                            src={profile.avatarUrl}
                                            alt={profile.fullName}
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                    ) : (
                                        <User className="w-4 h-4" />
                                    )}
                                </div>
                                <span className="hidden sm:inline font-bold text-sm text-slate-700 max-w-[120px] truncate">
                                    {profile.fullName}
                                </span>
                            </button>

                            {/* User Dropdown overlay */}
                            {isUserMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-100/60 z-40 py-2 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
                                        <div className="px-4 py-3 border-b border-slate-50">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                Nama Akun
                                            </p>
                                            <p className="font-bold text-slate-700 text-sm truncate mt-0.5">
                                                {profile.fullName}
                                            </p>
                                        </div>

                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                            className="flex items-center gap-3 w-full justify-start px-4 py-3 text-sm font-bold text-slate-800 hover:bg-blue-600 hover:text-white"
                                        >
                                            <Link
                                                href="/stores"
                                                onClick={() =>
                                                    setIsUserMenuOpen(false)
                                                }
                                            >
                                                <SwitchCamera className="h-4 w-4" />
                                                <span>Ganti Toko</span>
                                            </Link>
                                        </Button>

                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                            className="flex items-center gap-3 w-full justify-start px-4 py-3 text-sm text-slate-800 hover:bg-blue-600 hover:text-white"
                                        >
                                            <Link
                                                href={`/stores/${store.slug}/checkout`}
                                                onClick={() =>
                                                    setIsUserMenuOpen(false)
                                                }
                                            >
                                                <ShoppingCart className="h-4 w-4" />
                                                <span>Kasir</span>
                                            </Link>
                                        </Button>

                                        <button
                                            onClick={() => {
                                                setIsUserMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50/50 transition-colors font-bold border-t border-slate-50 text-left"
                                        >
                                            <LogOut className="w-4 h-4 text-red-500" />
                                            <span>Keluar Akun</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                {/* Mengubah padding 'p-4 md:p-8' agar tidak terlalu sempit di layar HP */}
                <main className="flex-1 overflow-y-auto bg-slate-50/60 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
}
