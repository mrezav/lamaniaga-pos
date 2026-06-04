import { CategoryForm } from "@/features/category/components/category-form";

export default async function CategoriesPage({
    params,
}: {
    params: Promise<{ storeSlug: string }>;
}) {
    const { storeSlug } = await params;
    return (
        <div className="bg-white p-12 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col items-center justify-center min-h-[420px] text-center space-y-6">
            <h1 className="text-2xl font-bold mb-6">Kelola Kategori</h1>
            <div className="max-w-md">
                <CategoryForm storeSlug={storeSlug} />
            </div>
        </div>
    );
}
