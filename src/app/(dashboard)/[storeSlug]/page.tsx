export default async function StoreDashboardPage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const { storeSlug } = await params;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight capitalize">
                    Dashboard {storeSlug.replace(/-/g, ' ')}
                </h1>
                <p className="text-slate-500 font-medium">Selamat datang kembali! Berikut adalah ringkasan performa toko Anda hari ini.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards Placeholder */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Penjualan</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">Rp 0</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Transaksi</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">0</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Produk Terjual</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">0</p>
                </div>
            </div>

            <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">Belum ada aktivitas</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">Mulai lakukan transaksi di kasir atau tambahkan produk baru untuk melihat statistik performa toko Anda di sini.</p>
                </div>
            </div>
        </div>
    )
}
