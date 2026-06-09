"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input"; // Tetap pakai ini untuk style border input, bukan wrapper form
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useCategoryMutations } from "../hooks/use-category-mutation";

import { toast } from "sonner";
import { CategoryInput, categorySchema } from "../schemas/category-schema";
import { useEffect } from "react";
import { CategoryRow } from "@/db/schema";

interface CategoryFormProps {
    storeSlug: string;
    categoryId?: string;
    initialData?: CategoryRow;
    serverError?: string;
}

export function CategoryForm({
    categoryId,
    storeSlug,
    initialData,
    serverError,
}: CategoryFormProps) {
    const router = useRouter();
    const { createCategory, isCreating, updateCategory, isUpdating } =
        useCategoryMutations(storeSlug, categoryId);
    const isEditMode = !!categoryId;
    const isSubmitting = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<CategoryInput>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: initialData?.name ?? "",
            description: initialData?.description ?? "",
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                description: initialData.description ?? "",
            });
        }
    }, [initialData, reset]);

    // =========================================================================
    // KONDISI A: JIKA TERJADI ERROR DI SERVER (Permission Denied / DB Error)
    // =========================================================================
    if (serverError) {
        return (
            <div className="w-full p-5 border border-red-200 bg-red-50/50 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5 text-red-800 font-semibold text-sm">
                    <div className="p-1.5 bg-red-100 rounded-lg text-red-600">
                        <AlertCircle className="h-4 w-4"></AlertCircle>
                    </div>
                    Akses Ditolak / Gagal Memuat Data
                </div>
                <p className="text-xs text-red-600 font-medium leading-relaxed bg-white border border-red-100 p-3 rounded-xl">
                    {serverError}
                </p>
                <div className="flex gap-2 pt-2 border-t border-red-100/60">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl h-10 px-4 border-slate-200 text-slate-600 hover:bg-slate-50"
                        onClick={() =>
                            router.push(`/stores/${storeSlug}/categories`)
                        }
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali ke List Kategori
                    </Button>
                </div>
            </div>
        );
    }

    // Handler eksekusi submit data
    async function onSubmit(values: CategoryInput) {
        try {
            let response;
            if (isEditMode && categoryId) {
                response = await updateCategory(values);
            } else {
                response = await createCategory(values);
            }

            // JIKA SERVER MENOLAK KARENA VALIDASI AMAN BERLAPIS GAGAL:
            if (response && !response.success && response.validationErrors) {
                // Lakukan perulangan untuk setiap field error yang dikirim oleh server
                Object.entries(response.validationErrors).forEach(
                    ([field, messages]) => {
                        if (messages && messages.length > 0) {
                            setError(field as keyof CategoryInput, {
                                type: "server", // Menandakan ini error kiriman dari server
                                message: messages[0], // Ambil baris pesan error pertama kustom Anda
                            });
                        }
                    },
                );

                toast.error("Validasi Gagal", {
                    description: "Silahkan periksa kembali input anda",
                });
                return;
            }

            toast.success(
                isEditMode
                    ? "Berhasil memperbarui kategori"
                    : "Berhasil membuat kategori",
            );
            router.push(`/stores/${storeSlug}/categories`);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Terjadi masalah internal";
            toast.error("Gagal Menyimpan", {
                description: message,
                duration: 3000,
            });
            console.error(err);
        }
    }

    // =========================================================================
    // KONDISI B: ALUR NORMAL (Jika Server Berhasil Mengambil Data)
    // =========================================================================
    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full space-y-6" // Hapus border internal dan buat w-full
        >
            {/* GRID LAYOUT UNTUK INPUT */}
            <div className="grid grid-cols-1 gap-6">
                {/* KIRI: INPUT NAMA */}
                <div className="flex flex-col space-y-2">
                    <label
                        htmlFor="name"
                        className="text-sm font-semibold text-slate-700"
                    >
                        Nama Kategori
                    </label>
                    <Input
                        id="name"
                        placeholder="Contoh: Elektronik, Pakaian"
                        disabled={isCreating}
                        className="h-11 rounded-xl border-slate-200 focus-visible:ring-slate-400 bg-slate-50/30"
                        {...register("name")}
                    />
                    {errors.name && (
                        <p className="text-xs font-medium text-red-500 mt-1">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                {/* FULL WIDTH DI BAWAH: DESKRIPSI */}
                <div className="flex flex-col space-y-2 md:col-span-2">
                    <label
                        htmlFor="description"
                        className="text-sm font-semibold text-slate-700"
                    >
                        Deskripsi{" "}
                        <span className="text-xs font-normal text-slate-400">
                            (Opsional)
                        </span>
                    </label>
                    <textarea
                        id="description"
                        placeholder="Masukkan penjelasan singkat mengenai kategori ini..."
                        disabled={isCreating}
                        rows={4}
                        className="flex w-full rounded-xl border border-slate-200 bg-slate-50/30 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
                        {...register("description")}
                    />
                    {errors.description && (
                        <p className="text-xs font-medium text-red-500 mt-1">
                            {errors.description.message}
                        </p>
                    )}
                </div>
            </div>

            {/* TOMBOL AKSI (FOOTER) */}
            <div className="flex gap-3 justify-end border-t border-slate-100 pt-5 mt-6">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isCreating}
                    className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50"
                    onClick={() =>
                        router.push(`/stores/${storeSlug}/categories`)
                    }
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white font-medium transition-all shadow-sm"
                >
                    {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isSubmitting
                        ? "Menyimpan..."
                        : isEditMode
                          ? "Perbarui"
                          : "Simpan"}
                </Button>
            </div>
        </form>
    );
}
