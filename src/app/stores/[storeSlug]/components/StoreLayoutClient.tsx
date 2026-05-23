"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/store/useToastStore";
import {
    LayoutDashboard,
    Package,
    FolderTree,
    QrCode,
    Bell,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Settings,
    Store,
    User,
    Copy,
    Check,
} from "lucide-react";

interface StoreLayoutClientProps {
    children: React.ReactNode;
    store: {
        id: string;
        name: string;
        slug: string;
        logoUrl?: string | null;
        joinCode?: string | null;
        ownerId: string;
    };
    profile: {
        id: string;
        fullName: string;
        avatarUrl?: string | null;
    };
}

export function StoreLayoutClient({
    children,
    store,
    profile,
}: StoreLayoutClientProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const { showToast } = useToastStore();

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

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
            name: "Product",
            href: `/stores/${store.slug}/products`,
            icon: Package,
        },
        {
            name: "Category",
            href: `/stores/${store.slug}/categories`,
            icon: FolderTree,
        },
    ];

    const isOwner = store.ownerId === profile.id;
    if (isOwner) {
        menuItems.push({
            name: "Kode Toko",
            href: `/stores/${store.slug}/join-store`,
            icon: QrCode,
        });
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans w-full">
            {/* 1. Sidebar Navigation */}
            <aside
                className={`fixed inset-y-0 left-0 z-20 flex flex-col h-full bg-[#0F172A] border-r border-[#1E293B] text-slate-300 transition-all duration-300 ${
                    isSidebarCollapsed ? "w-20" : "w-64"
                }`}
            >
                {/* Sidebar Header: Logo & Store Name */}
                <div className="flex items-center justify-between h-20 px-4 border-b border-[#1E293B] shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 border border-blue-500 shrink-0 shadow-lg shadow-blue-500/10">
                            {store.logoUrl ? (
                                <img
                                    src={store.logoUrl}
                                    alt={store.name}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                <Store className="w-5 h-5 text-white" />
                            )}
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="flex flex-col truncate">
                                <span className="font-extrabold text-white text-sm tracking-tight leading-tight">
                                    {store.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                    Pemilik Toko
                                </span>
                            </div>
                        )}
                    </div>
                    {!isSidebarCollapsed && (
                        <button
                            onClick={() => setIsSidebarCollapsed(true)}
                            className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Sidebar Middle Content: Navigation Links */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    {isSidebarCollapsed && (
                        <div className="flex justify-center mb-6">
                            <button
                                onClick={() => setIsSidebarCollapsed(false)}
                                className="p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group ${
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                                        : "hover:bg-slate-800/50 hover:text-white text-slate-400"
                                }`}
                            >
                                <item.icon
                                    className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                                />
                                {!isSidebarCollapsed && (
                                    <span>{item.name}</span>
                                )}
                            </Link>
                        );
                    })}

                    {/* Store Code Copyable Field */}
                    {store.joinCode && (
                        <div
                            onClick={copyStoreCode}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 group ${
                                isSidebarCollapsed
                                    ? "justify-center hover:bg-slate-800/50 text-slate-400 hover:text-white"
                                    : "bg-slate-800/35 border border-[#1E293B] hover:bg-slate-800 text-slate-300 hover:text-white"
                            }`}
                        >
                            <QrCode className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-white" />
                            {!isSidebarCollapsed && (
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            Kode Toko
                                        </span>
                                        <span className="text-xs font-mono font-bold mt-0.5">
                                            {store.joinCode}
                                        </span>
                                    </div>
                                    {isCopied ? (
                                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-white" />
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                {/* Sidebar Footer: Trademark */}
                <div className="p-4 border-t border-[#1E293B] shrink-0 text-center flex flex-col items-center justify-center">
                    {!isSidebarCollapsed ? (
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Trademark
                            </p>
                            <p className="text-xs text-slate-400 font-semibold font-mono">
                                © 2026 Lamaniaga
                            </p>
                        </div>
                    ) : (
                        <span className="text-xs font-black font-mono text-slate-600">
                            L&apos;26
                        </span>
                    )}
                </div>
            </aside>

            {/* 2. Main Area: Topbar and Content Wrapper */}
            <div
                className={`flex flex-col flex-1 h-full overflow-hidden transition-all duration-300 ${
                    isSidebarCollapsed ? "pl-20" : "pl-64"
                }`}
            >
                {/* Topbar/Header */}
                <header className="flex items-center justify-between h-20 px-8 bg-white border-b border-slate-200 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 capitalize tracking-tight">
                            {pathname === `/stores/${store.slug}/dashboard`
                                ? "Ringkasan Toko"
                                : pathname.split("/").pop()}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Store Switcher Option if user has multiple stores or just links to Selector */}
                        <Link href="/stores">
                            <button className="text-xs font-bold text-slate-500 hover:text-blue-600 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-200 transition-colors">
                                Ganti Toko
                            </button>
                        </Link>

                        {/* Notification Icon */}
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors group">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full group-hover:scale-110 transition-transform" />
                        </button>

                        {/* Profile Dropdown Menu */}
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setIsUserMenuOpen(!isUserMenuOpen)
                                }
                                className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                            >
                                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-black shrink-0 border border-blue-100">
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
                                        <Link
                                            href={`/stores/${store.slug}/settings`}
                                            onClick={() =>
                                                setIsUserMenuOpen(false)
                                            }
                                            className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors font-semibold"
                                        >
                                            <Settings className="w-4 h-4 text-slate-400" />
                                            Settings
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setIsUserMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50/50 transition-colors font-bold border-t border-slate-50"
                                        >
                                            <LogOut className="w-4 h-4 text-red-500" />
                                            Keluar Akun
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-slate-50/60 p-8">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
}
