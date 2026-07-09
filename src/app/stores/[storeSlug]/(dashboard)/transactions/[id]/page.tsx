import { TransactionDetail } from "@/features/transaction/components/TransactionDetail";

interface Props {
    params: Promise<{ id: string; storeSlug: string }>;
}

export default async function TransactionDetailPage({ params }: Props) {
    const { id, storeSlug } = await params;

    console.log(storeSlug, id);

    return (
        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col min-h-105 space-y-6 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Rincian Transaksi
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Rincian riwayat transaksi di toko Anda, baik pembayaran
                        cash maupun angsuran.
                    </p>
                </div>
            </div>
            <div className="w-full">
                <div>
                    <TransactionDetail
                        id={id}
                        storeSlug={storeSlug}
                    ></TransactionDetail>
                </div>
            </div>
        </div>
    );
}
