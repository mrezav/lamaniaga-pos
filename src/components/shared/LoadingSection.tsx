import { Loader2 } from "lucide-react";

export default function LoadingSection() {
    return (
        <div className="flex flex-col m-auto text-muted-foreground gap-2 items-center justify-center p-8">
            <Loader2 className="h-10 w-10 animate-spin" />
            <span className="text-md font-bold">Memuat data...</span>
        </div>
    );
}
