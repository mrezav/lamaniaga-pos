import { Button } from "@/components/ui/button";
import TransactionList from "@/features/transaction/components/transaction-list";
import { getStoreBySlug } from "@/lib/store";

interface Props {
    params: Promise<{ storeSlug: string }>;
}

export default async function InvoicesPage({ params }: Props) {
    const { storeSlug } = await params;
    const store = await getStoreBySlug(storeSlug);

    return (
        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col min-h-105 space-y-6 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                        Riwayat Transaksi
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manajemen pelacakan invoice, metode pembayaran, dan
                        status tagihan real-time.
                    </p>
                </div>
            </div>
            <div className="w-full">
                <TransactionList
                    storeId={store.id}
                    storeSlug={storeSlug}
                ></TransactionList>
            </div>
        </div>
    );
}
