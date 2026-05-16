export default async function StoreLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ storeSlug: string }>
}) {
    const { storeSlug } = await params;

    return (
        <div className="flex flex-col flex-1">
            {/* Store-Specific Sub-Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm relative z-10">
                <div className="container mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100 shrink-0">
                        <span className="text-white font-bold text-2xl">{storeSlug[0].toUpperCase()}</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight capitalize">{storeSlug.replace(/-/g, ' ')}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Toko Aktif</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto p-6 lg:p-8">
                {children}
            </div>
        </div>
    )
}
