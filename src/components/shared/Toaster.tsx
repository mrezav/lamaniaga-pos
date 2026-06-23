"use client";

import { useToastStore } from "@/state/useToastStore";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

export function Toaster() {
    const { toasts, dismissToast } = useToastStore();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch issues by only mounting on client
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
            {toasts.map((toast) => {
                const isSuccess = toast.type === "success";
                const isError = toast.type === "error";

                return (
                    <div
                        key={toast.id}
                        className={`
              pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg 
              transition-all duration-300 transform translate-y-0 opacity-100 scale-100
              animate-in fade-in slide-in-from-top-4 duration-300
              ${
                  isSuccess
                      ? "bg-emerald-50/95 backdrop-blur-sm border-emerald-100 text-emerald-900 shadow-emerald-100/50"
                      : isError
                        ? "bg-rose-50/95 backdrop-blur-sm border-rose-100 text-rose-900 shadow-rose-100/50"
                        : "bg-blue-50/95 backdrop-blur-sm border-blue-100 text-blue-900 shadow-blue-100/50"
              }
            `}
                    >
                        <div className="mt-0.5 shrink-0">
                            {isSuccess && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            )}
                            {isError && (
                                <AlertCircle className="w-5 h-5 text-rose-600" />
                            )}
                            {!isSuccess && !isError && (
                                <Info className="w-5 h-5 text-blue-600" />
                            )}
                        </div>

                        <div className="flex-1 text-sm font-medium leading-relaxed">
                            {toast.message}
                        </div>

                        <button
                            onClick={() => dismissToast(toast.id)}
                            className={`
                mt-0.5 p-0.5 rounded-lg transition-colors shrink-0
                ${
                    isSuccess
                        ? "text-emerald-500 hover:bg-emerald-100 hover:text-emerald-800"
                        : isError
                          ? "text-rose-500 hover:bg-rose-100 hover:text-rose-800"
                          : "text-blue-500 hover:bg-blue-100 hover:text-blue-800"
                }
              `}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
