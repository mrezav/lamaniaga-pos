"use client";

import { useForm } from "react-hook-form";
import { useCreateCategoryMutation } from "../hooks/use-category-mutation";
import { CategoryFormValues, categorySchema } from "../schemas/category-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export const CategoryForm = ({ storeSlug }: { storeSlug: string }) => {
    const [errMessage, setErrMessage] = useState<string | null>(null);

    // Ambil fungsi mutate dan status error langsung dari Hook bawaan TanStack
    const { mutate, isPending } = useCreateCategoryMutation(storeSlug);

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: "", description: "" },
    });

    const onSubmit = (values: CategoryFormValues) => {
        setErrMessage(null);

        mutate(values, {
            onSuccess: () => {
                // UI hanya fokus pada efek visual jika sukses sejati
                form.reset();
            },
            onError: (error: unknown) => {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Gagal membuat kategori";
                // Pesan error dari lib/guard otomatis mendarat di sini berupa string murni
                setErrMessage(message);
            },
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {errMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm font-medium">
                    ⚠️ {errMessage}
                </div>
            )}
            <Input
                placeholder="Nama"
                {...form.register("name")}
                className="
                    w-full md:w-[400px]
                    h-11
                    rounded-xl
                    border-border/60
                    bg-background
                    px-4
                    text-sm
                    shadow-sm
                    transition-all
                    placeholder:text-muted-foreground/70
                    focus-visible:ring-2
                    focus-visible:ring-blue-500/20
                    focus-visible:border-blue-500
                    focus-visible:shadow-md"
            />
            {form.formState.errors.name && (
                <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.name.message}
                </p>
            )}
            <Textarea
                placeholder="Deskripsi"
                {...form.register("description")}
                className="
                    w-full md:w-[400px]
                    min-h-[140px]
                    rounded-xl
                    border-border/60
                    bg-background
                    px-4 py-3
                    text-sm
                    shadow-sm
                    resize-none
                    transition-all
                    placeholder:text-muted-foreground/70
                    focus-visible:ring-2
                    focus-visible:ring-blue-500/20
                    focus-visible:border-blue-500
                    focus-visible:shadow-md
                "
            />

            <Button
                type="submit"
                disabled={isPending}
                className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-100 transition-all flex items-center gap-2 text-xs"
            >
                {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
        </form>
    );
};
