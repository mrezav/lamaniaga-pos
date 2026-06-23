import { CategoryTable } from "@/features/category/components/category-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface CategoriesPageProps {
    params: Promise<{ storeSlug: string }>;
}

export default async function CategoriesPage({ params }: CategoriesPageProps) {
    const { storeSlug } = await params;

    return (
        /* CONTEXT PARENT PREMIUM: Menggunakan rounded-[2rem] & background putih bersih */
        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col min-h-[420px] space-y-6 w-full">
            {/* TOP HEADER BAR: Judul & Deskripsi Halaman */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Kategori Produk
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Kelola kelompok produk toko Anda untuk mempermudah
                        navigasi pelanggan.
                    </p>
                </div>

                {/* Tombol Create diletakkan di Header Utama untuk Akses Cepat */}
                <Button
                    asChild
                    className="rounded-xl h-11 px-5 bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-medium self-start sm:self-auto gap-2"
                >
                    <Link href={`/stores/${storeSlug}/categories/create`}>
                        <Plus className="h-4 w-4" />
                        Tambah Kategori
                    </Link>
                </Button>
            </div>

            {/* COMPONENT TABEL UTAMA (Otomatis Full Width) */}
            <div className="w-full">
                <CategoryTable storeSlug={storeSlug} />
            </div>
        </div>
    );
}
