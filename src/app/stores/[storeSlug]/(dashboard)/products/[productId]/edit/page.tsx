import getProductByIdAction from "@/features/product/actions/get-product";
import { EditProductForm } from "@/features/product/components/edit-product-form";
import { editProductSchema } from "@/features/product/schemas/product-schema";
import { UserAction } from "@/types";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface EditProductPageProps {
    params: Promise<{ storeSlug: string; productId: string }>;
}

export default async function CreateProductPage({
    params,
}: EditProductPageProps) {
    const { storeSlug, productId } = await params;

    const { success, error, data } = await getProductByIdAction(
        storeSlug,
        productId,
        UserAction.EDIT,
    );
    if (!success) {
        // JIKA USER TIDAK MEMILIKI AUTHORIZATION UNTUK HALAMAN/AKSI INI TAMBAHKAN ?trigger=unauthorized SAAT REDIRECT
        // UNTUK MEMICU TOASTTRIGGER
        redirect(`/stores/${storeSlug}/products?trigger=unauthorized`);
    }

    const initialData = editProductSchema.parse(data);

    return (
        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col min-h-105 space-y-6 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Edit Produk
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Edit produk untuk toko Anda. Pilih single product atau
                        varian produk.
                    </p>
                </div>
                <Link
                    href={`/stores/${storeSlug}/products`}
                    className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 gap-1 w-fit transition-colors"
                >
                    <ChevronLeft className="h-3.5 w-3.5" /> Kembali ke Daftar
                    Produk
                </Link>
            </div>
            <div className="w-full">
                <EditProductForm
                    storeSlug={storeSlug}
                    productId={productId}
                    initialData={initialData}
                />
            </div>
        </div>
    );
}
