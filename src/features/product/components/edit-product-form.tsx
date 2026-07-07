"use client";

import { useForm } from "react-hook-form";
import {
    ProductInput,
    ProductOutput,
    productSchema,
} from "../schemas/product-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCategoryList } from "@/features/category/hooks/use-categories";
import ProductVariantForm from "./product-variant-form";
import { useProductMutations } from "../hooks/use-product-mutations";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface props {
    storeSlug: string;
    productId: string;
    initialData: ProductOutput;
}

export function EditProductForm({ storeSlug, productId, initialData }: props) {
    const router = useRouter();
    const [imagePreview, setImagePreview] = useState<string>("");
    const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);

    const handleVariantDelete = (id: string) => {
        setDeletedVariantIds((prev) => [...prev, id]);
    };

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        setError,
        formState: { errors },
    } = useForm<ProductInput>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            ...initialData,
            variants: initialData.variants.map((variant) => ({
                ...variant,
                stock: Number(variant.stock),
            })),
        },
    });

    useEffect(() => {
        if (initialData && initialData.imageUrl) {
            // Masukkan URL gambar lama dari Supabase ke state preview
            setImagePreview(initialData.imageUrl);
        }
    }, [initialData, setValue]);

    // const watchVariants = watch("variants");

    const { updateProduct, isUpdating } = useProductMutations(storeSlug);
    async function onSubmit(data: ProductInput) {
        try {
            const formData = new FormData();
            if (data.imageFile instanceof File) {
                formData.append("imageFile", data.imageFile);
            }

            const textPayload = {
                id: productId,
                name: data.name,
                merk: data.merk,
                categoryId: data.categoryId || null,
                description: data.description || null,
                imageUrl: data.imageUrl || null,
                isActive: data.isActive,
                hasVariants: data.hasVariants,
                variants: data.variants, // Array variant Anda tetap utuh di dalam sini
                deletedVariantIds,
            };

            // console.log("========PAYLOAD============");
            // console.log(textPayload);
            // console.log("===========================");

            formData.append("document", JSON.stringify(textPayload));
            const response = await updateProduct(formData);
            if (response && !response.success && response.validationErrors) {
                Object.entries(response.validationErrors).forEach(
                    ([field, messages]) => {
                        if (messages && messages.length > 0) {
                            setError(field as keyof ProductInput, {
                                type: "server",
                                message: messages[0],
                            });
                        }
                    },
                );
                toast.error("Validasi Gagal", {
                    description: "Silahkan periksa kembali input anda",
                });
                return;
            }

            toast.success("Produk berhasil diubah!");
            router.push(`/stores/${storeSlug}/products`);
        } catch (error) {
            console.error(error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan saat menyimpan perubahan produk.",
            );
        }
    }

    async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
            return;
        }

        const preview = URL.createObjectURL(file);
        setImagePreview(preview);
        setValue("imageFile", file);
    }

    const { data: categoryListData, error: errorCategory } =
        useCategoryList(storeSlug);
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mx-auto">
            <div className="grid grid-cols-1 gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                        Nama Produk
                    </label>
                    <Input
                        {...register("name")}
                        className="focus-visible:ring-teal-500"
                    />
                    {errors.name && (
                        <p className="text-xs text-red-500">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                            Merk
                        </label>
                        <Input
                            {...register("merk")}
                            className="focus-visible:ring-teal-500"
                        />
                        {errors.merk && (
                            <p className="text-xs text-red-500">
                                {errors.merk.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                            <span>Kategori</span>
                            {errorCategory && (
                                <span className="text-xs font-bold text-red-600">
                                    {errorCategory.message}
                                </span>
                            )}
                        </label>
                        <select
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                            {...register("categoryId")}
                            value={watch("categoryId") ?? ""}
                        >
                            <option value="">Pilih Kategori</option>
                            {categoryListData?.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {errors.categoryId && (
                            <p className="text-xs text-red-500">
                                {errors.categoryId.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                        Deskripsi
                    </label>
                    <Textarea
                        {...register("description")}
                        rows={4}
                        className="focus-visible:ring-teal-500"
                    />
                    {errors.description && (
                        <p className="text-xs text-red-500">
                            {errors.description.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                        Gambar Produk (Maksimal 5MB)
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleImageChange}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 transition w-full sm:w-auto"
                        />
                        {imagePreview && (
                            <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-teal-200 overflow-hidden bg-slate-50 flex-shrink-0">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                    {errors.imageFile && (
                        <p className="text-xs text-red-500">
                            {errors.imageFile?.message as string}
                        </p>
                    )}
                </div>

                <ProductVariantForm
                    control={control}
                    errors={errors}
                    register={register}
                    onVariantDelete={handleVariantDelete}
                />
            </div>

            {/* ACTIONS BUTTON */}
            <Button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white h-11 rounded-xl font-medium transition shadow-sm"
            >
                {isUpdating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan ke sistem...
                    </>
                ) : (
                    "Simpan Perubahan Produk"
                )}
            </Button>

            {/* LIVE PREVIEW BOX */}
            {/* <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl mt-10">
                <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">
                    ⚡ Live Preview State Array:
                </p>
                <pre className="text-xs font-mono text-slate-300 bg-slate-950/60 p-4 rounded-xl overflow-x-auto max-h-64 border border-slate-800/50">
                    {JSON.stringify(watchVariants, null, 2)}
                </pre>
            </div> */}
        </form>
    );
}
