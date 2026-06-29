import { ProductTable } from "@/features/product/components/product-table";

interface ProductsPageProps {
    params: Promise<{ storeSlug: string }>;
}

export default async function ProductsPage({ params }: ProductsPageProps) {
    const { storeSlug } = await params;

    return (
        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col min-h-105 space-y-6 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Daftar Produk
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Kelola produk toko Anda, termasuk produk single dan
                        produk berkategori variant.
                    </p>
                </div>
            </div>
            <div className="w-full">
                <ProductTable storeSlug={storeSlug} />
            </div>
        </div>
    );
}
