import { CreateProductForm } from "@/features/product/components/create-product-form";
import { getStoreBySlug } from "@/lib/store";
import { notFound } from "next/navigation";

interface CreateProductPageProps {
    params: Promise<{ storeSlug: string }>;
}

export default async function CreateProductPage({
    params,
}: CreateProductPageProps) {
    const { storeSlug } = await params;
    const store = await getStoreBySlug(storeSlug);

    if (!store) {
        notFound();
    }

    return (
        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col min-h-105 space-y-6 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Tambah Produk
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Tambahkan produk baru untuk toko Anda. Pilih single
                        product atau varian produk.
                    </p>
                </div>
            </div>
            <div className="w-full">
                <CreateProductForm storeSlug={storeSlug} />
            </div>
        </div>
    );
}
