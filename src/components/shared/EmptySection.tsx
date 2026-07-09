import { SearchAlert } from "lucide-react";

export default function EmptySection() {
    return (
        <div className="flex flex-col m-auto text-muted-foreground items-center justify-center p-8 border border-dashed rounded-3xl min-h-60 bg-card">
            <div className="p-4 bg-slate-50 rounded-2xl dark:bg-slate-900 mb-3">
                <SearchAlert className="h-10 w-10 text-slate-400 stroke-[1.5]" />
                {/* <Receipt className="h-8 w-8 text-slate-400 stroke-[1.5]" /> */}
            </div>
            <span className="text-md font-bold">Data tidak ditemukan</span>
            <p className="text-xs text-muted-foreground max-w-xs">
                Ubah parameter filter atau buat data baru.
            </p>
        </div>
    );
}
