// components/ToastTrigger.tsx
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function ToastTrigger() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const trigger = searchParams.get("trigger");

        if (trigger === "unauthorized") {
            // 1. Pemicu toast Sonner
            toast.error("Anda tidak memiliki akses untuk aksi ini.");
            console.log("trigger");

            // 2. Bersihkan URL tanpa melakukan refresh halaman
            const params = new URLSearchParams(searchParams.toString());
            params.delete("trigger");

            const createQuery = params.toString()
                ? `?${params.toString()}`
                : "";
            window.history.replaceState(null, "", `${pathname}${createQuery}`);
        }
    }, [searchParams, pathname]);

    return null;
}
