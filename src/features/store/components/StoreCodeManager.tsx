"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToastStore } from "@/state/useToastStore";
import { Button } from "@/components/ui/button";
import { Copy, Check, QrCode, RefreshCw, Loader2 } from "lucide-react";
import { generateJoinCodeAction } from "../actions/generate-code";

interface StoreCodeManagerProps {
    storeId: string;
    initialCode: string | null;
}

export function StoreCodeManager({
    storeId,
    initialCode,
}: StoreCodeManagerProps) {
    const { showToast } = useToastStore();
    const [code, setCode] = useState(initialCode);
    const [isCopied, setIsCopied] = useState(false);

    // Copy code to clipboard logic
    const handleCopy = async () => {
        if (!code) {
            showToast(
                "Belum ada kode yang di-generate. Silakan buat kode terlebih dahulu.",
                "error",
            );
            return;
        }
        try {
            await navigator.clipboard.writeText(code);
            setIsCopied(true);
            showToast("Kode toko berhasil disalin ke papan klip!", "success");
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error(err);
            showToast("Gagal menyalin kode.", "error");
        }
    };

    // TanStack Query Mutation to generate join code
    const mutation = useMutation({
        mutationFn: async () => {
            const result = await generateJoinCodeAction(storeId);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result;
        },
        onSuccess: (data) => {
            if (data.joinCode) {
                setCode(data.joinCode);
            }
            showToast("Kode bergabung toko berhasil diperbarui!", "success");
        },
        onError: (error: unknown) => {
            const message =
                error instanceof Error ? error.message : String(error);
            showToast(message || "Gagal memperbarui kode toko.", "error");
        },
    });

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/40 space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">
                        Kode Akses Toko
                    </h3>
                    <p className="text-slate-400 text-xs font-semibold">
                        Bagikan kode ini ke staf Anda
                    </p>
                </div>
            </div>

            {/* Code Display Box */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                <span
                    className={`font-mono text-xl font-black tracking-widest text-slate-700 ${!code && "text-slate-300 font-sans text-sm tracking-normal font-semibold"}`}
                >
                    {code || "Belum ada kode"}
                </span>

                {code && (
                    <Button
                        onClick={handleCopy}
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                        {isCopied ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </Button>
                )}
            </div>

            {/* Generate Button */}
            <Button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="w-full h-12 rounded-2xl font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 text-sm shadow-md shadow-slate-900/10"
            >
                {mutation.isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memproses...</span>
                    </>
                ) : (
                    <>
                        <RefreshCw className="w-4 h-4" />
                        <span>
                            {code
                                ? "Generate Ulang Kode"
                                : "Generate Kode Baru"}
                        </span>
                    </>
                )}
            </Button>
        </div>
    );
}
