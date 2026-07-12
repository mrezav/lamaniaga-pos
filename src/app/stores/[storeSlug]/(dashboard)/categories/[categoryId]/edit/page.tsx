import { getCategoryByIdAction } from "@/features/category/actions/get-category";
import { CategoryForm } from "@/features/category/components/CategoryForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function EditCategoryPage({
    params,
}: {
    params: Promise<{ storeSlug: string; categoryId: string }>;
}) {
    const { storeSlug, categoryId } = await params;
    const response = await getCategoryByIdAction(categoryId, storeSlug);

    return (
        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col min-h-[420px] space-y-8 w-full">
            {/* TOP NAVIGATION & HEADER BAR */}
            <div className="flex flex-col space-y-3 border-b border-slate-100 pb-5">
                <Link
                    href={`/stores/${storeSlug}/categories`}
                    className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 gap-1 w-fit transition-colors"
                >
                    <ChevronLeft className="h-3.5 w-3.5" /> Kembali ke Kategori
                </Link>

                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Kelola Kategori
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Tambahkan atau perbarui data kategori untuk manajemen
                        produk yang lebih rapi.
                    </p>
                </div>
            </div>

            {/* MAIN FORM CONTAINER (Sekarang Full Width) */}
            <div className="w-full">
                <CategoryForm
                    categoryId={categoryId}
                    storeSlug={storeSlug}
                    initialData={response.success ? response.data : undefined}
                    serverError={!response.success ? response.error : undefined}
                />
            </div>
        </div>
    );
}
