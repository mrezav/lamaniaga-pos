"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toSlug } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input"; // Tetap pakai ini untuk style border input, bukan wrapper form
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCategoryMutations } from "../hooks/use-category-mutation";
import {
    createCategorySchema,
    CreateCategoryInput,
} from "../schemas/category-schema";

interface CategoryFormProps {
    storeSlug: string;
}

export function CategoryForm({ storeSlug }: CategoryFormProps) {
    const router = useRouter();
    const { createCategory, isCreating } = useCategoryMutations(storeSlug);

    // Inisialisasi React Hook Form standar dengan validasi Zod
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateCategoryInput>({
        resolver: zodResolver(createCategorySchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
        },
    });

    // Otomatis mengawasi input 'name' untuk mengubah nilai 'slug'
    const watchName = watch("name");

    useEffect(() => {
        if (watchName) {
            setValue("slug", toSlug(watchName), { shouldValidate: true });
        } else {
            setValue("slug", "");
        }
    }, [watchName, setValue]);

    // Handler eksekusi submit data
    async function onSubmit(values: CreateCategoryInput) {
        try {
            await createCategory(values);
            router.push(`/stores/${storeSlug}/categories`);
        } catch (err) {
            console.error("Gagal menyimpan kategori:", err);
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full space-y-6" // Hapus border internal dan buat w-full
        >
            {/* GRID LAYOUT UNTUK INPUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* KANAN: INPUT SLUG (READONLY) */}
                <div className="flex flex-col space-y-2">
                    <label
                        htmlFor="slug"
                        className="text-sm font-semibold text-slate-400"
                    >
                        Slug (Otomatis)
                    </label>
                    <Input
                        id="slug"
                        placeholder="Otomatis terisi..."
                        className="h-11 rounded-xl bg-slate-100 border-slate-200/60 font-mono text-xs text-slate-500 cursor-not-allowed"
                        disabled
                        {...register("slug")}
                    />
                    {errors.slug && (
                        <p className="text-xs font-medium text-red-500 mt-1">
                            {errors.slug.message}
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
                    disabled={isCreating}
                    className="rounded-xl h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white font-medium transition-all shadow-sm"
                >
                    {isCreating && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Simpan Kategori
                </Button>
            </div>
        </form>
    );
}
