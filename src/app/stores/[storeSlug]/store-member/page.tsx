import { QrCode } from "lucide-react";
import {
    StoreCodeManager,
    StoreMembersTable,
} from "@/features/stores/components";
import { toast } from "sonner";
import { getStoreAction } from "@/features/stores/actions/get-store";
interface StoreCodePageProps {
    params: Promise<{
        storeSlug: string;
    }>;
}

export default async function StoreCodePage({ params }: StoreCodePageProps) {
    const { storeSlug } = await params;
    // Mengambil data store langsung ke action
    const { success, data, error } = await getStoreAction(storeSlug);
    if (!success) {
        toast.error(error);
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-6xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-[#1E293B] p-8 rounded-3xl text-white border border-[#334155]/20 shadow-xl shadow-slate-900/5 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <QrCode className="w-8 h-8 text-emerald-400" />
                        Kode Toko & Keanggotaan
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">
                        Kelola kode bergabung unik dan kelola persetujuan staf
                        kasir untuk toko Anda.
                    </p>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Code Manager */}
                <div className="lg:col-span-1 space-y-6">
                    <StoreCodeManager
                        storeId={data ? data.id : ""}
                        initialCode={data ? data.joinCode : ""}
                    />
                </div>

                {/* Right Column: Members Table */}
                <div className="lg:col-span-2">
                    <StoreMembersTable storeId={data ? data.id : ""} />
                </div>
            </div>
        </div>
    );
}
