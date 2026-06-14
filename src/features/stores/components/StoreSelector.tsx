"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setActiveStoreAction } from "@/features/stores/services/store-actions";
import { useToastStore } from "@/state/useToastStore";
import { Store, ArrowRight, Loader2 } from "lucide-react";
import { StoreRow } from "@/db/schema";
import { useStores } from "../hooks/use-stores";

// interface StoreData {
//     id: string;
//     name: string;
//     slug: string;
//     logoUrl?: string | null;
//     ownerId: string;
// }

// interface StoreSelectorProps {
//     stores: StoreRow;
//     userId: string;
// }

export function StoreSelector() {
    const router = useRouter();
    const { showToast } = useToastStore();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { getUserStoresQuery } = useStores();

    const data = getUserStoresQuery.data;
    const handleSelectStore = async (store: StoreRow) => {
        if (selectedId) return;
        setSelectedId(store.id);

        try {
            const result = await setActiveStoreAction(store.id);
            if (!result.success) {
                throw new Error(result.error);
            }
            showToast(`Mengalihkan ke toko ${store.name}...`, "success");
            await router.push(`/stores/${store.slug}/dashboard`);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Gagal masuk ke toko";
            showToast(message, "error");
            setSelectedId(null);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-2 px-4 space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-1">
                {data?.map(({ store, member }) => {
                    // const isOwner = store.ownerId === userId;
                    const isLoading = selectedId === store.id;
                    const isAnyLoading = selectedId !== null;

                    return (
                        <div
                            key={store.id}
                            onClick={() =>
                                !isAnyLoading && handleSelectStore(store)
                            }
                            className={`p-6 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all duration-300 relative flex items-center justify-between group ${
                                isAnyLoading
                                    ? "opacity-60 cursor-not-allowed"
                                    : "cursor-pointer hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5"
                            }`}
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                {/* Logo / Initials */}
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    {store.logoUrl ? (
                                        <img
                                            src={store.logoUrl}
                                            alt={store.name}
                                            className="w-full h-full object-cover rounded-2xl"
                                        />
                                    ) : (
                                        <Store className="w-7 h-7" />
                                    )}
                                </div>

                                <div className="space-y-1.5 min-w-0">
                                    <h3 className="text-lg font-black text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                        {store.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {/* {isOwner ? (
                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100/50 rounded-md">
                                                Pemilik Toko
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100/50 rounded-md">
                                                Staf Kasir
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-400 font-medium truncate font-mono">
                                            /{store.slug}
                                        </span> */}
                                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100/50 rounded-md">
                                            {member.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Indicator */}
                            <div className="shrink-0 pl-4">
                                {isLoading ? (
                                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
