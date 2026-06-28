import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface Props {
    params: Promise<{ storeSlug: string }>;
}

export default async function CheckoutPage({ params }: Props) {
    const { storeSlug } = await params;

    return (
        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col min-h-105 space-y-6 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Kasir
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Kelola seluruh riwayat transaksi di toko Anda, baik
                        pembayaran cash maupun angsuran.
                    </p>
                </div>
            </div>
            <div className="w-full">
                <Button asChild variant="outline">
                    <Link href={`/stores/${storeSlug}/pos`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Transaksi Baru
                    </Link>
                </Button>
            </div>
        </div>
    );
}
