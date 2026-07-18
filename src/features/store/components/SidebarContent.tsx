import React from "react";
import Link from "next/link"; // atau 'react-router-dom' tergantung framework Anda
import {
    Store,
    ChevronLeft,
    ChevronRight,
    QrCode,
    Check,
    Copy,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { StoreMemberRow, StoreRow } from "@/db/schema";

interface SidebarProps {
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (collapsed: boolean) => void;
    store: StoreRow;
    storeMember: StoreMemberRow;
    menuItems: any[];
    pathname: string;
    copyStoreCode: () => void;
    isCopied: boolean;
    isMobile?: boolean; // prop tambahan untuk mendeteksi mode mobile
}

export function SidebarContent({
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    store,
    storeMember,
    menuItems,
    pathname,
    copyStoreCode,
    isCopied,
    isMobile = false,
}: SidebarProps) {
    // Jika di mobile, kita paksa sidebar selalu terbuka penuh (tidak collapsed)
    const collapsed = isMobile ? false : isSidebarCollapsed;

    return (
        <div className="flex flex-col h-full bg-[#0F172A] text-slate-300">
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
                    {!collapsed && (
                        <div className="flex flex-col truncate animate-in fade-in duration-200">
                            <span className="font-extrabold text-white text-sm tracking-tight leading-tight">
                                {store.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                {storeMember.role}
                            </span>
                        </div>
                    )}
                </div>

                {/* Tombol collapse tersembunyi di mobile */}
                {!collapsed && !isMobile && (
                    <button
                        onClick={() => setIsSidebarCollapsed(true)}
                        className="hidden md:flex p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Sidebar Middle Content: Navigation Links */}
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {collapsed && !isMobile && (
                    <div className="hidden md:flex justify-center mb-6">
                        <button
                            onClick={() => setIsSidebarCollapsed(false)}
                            className="p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {menuItems.map((item, i) => {
                    const isActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);
                    return (
                        <TooltipProvider key={i} delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group ${
                                            isActive
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                                                : "hover:bg-slate-800/50 hover:text-white text-slate-400"
                                        } ${collapsed ? "justify-center" : ""}`}
                                    >
                                        <item.icon
                                            className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`}
                                        />
                                        {!collapsed && (
                                            <span className="animate-in fade-in duration-200">
                                                {item.name}
                                            </span>
                                        )}
                                    </Link>
                                </TooltipTrigger>
                                {collapsed && (
                                    <TooltipContent
                                        side="right"
                                        className="bg-slate-900 text-white border-none ml-2"
                                    >
                                        <p>{item.name}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    );
                })}

                {/* Store Code Copyable Field */}
                {store.joinCode && (
                    <div
                        onClick={copyStoreCode}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 group ${
                            collapsed
                                ? "justify-center hover:bg-slate-800/50 text-slate-400 hover:text-white"
                                : "bg-slate-800/35 border border-[#1E293B] hover:bg-slate-800 text-slate-300 hover:text-white"
                        }`}
                    >
                        <QrCode className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-white" />
                        {!collapsed && (
                            <div className="flex items-center justify-between w-full animate-in fade-in duration-200">
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
                {!collapsed ? (
                    <div className="space-y-1 animate-in fade-in duration-200">
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
        </div>
    );
}
