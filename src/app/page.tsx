import { getCategories } from "@/features/products/services/category-actions";

export default async function Home() {
  const { data: categories, error } = await getCategories("00000000-0000-0000-0000-000000000000");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tes Koneksi Database</h1>

      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-slate-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Daftar Kategori:</h2>
        {categories.length === 0 ? (
          <p className="text-slate-500 italic">Belum ada kategori di database.</p>
        ) : (
          <pre className="text-sm">{JSON.stringify(categories, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
