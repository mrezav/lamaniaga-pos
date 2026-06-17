"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    ProductInput,
    productSchema,
} from "@/features/product/schemas/product-schema";
import { useCreateProduct } from "@/features/product/hooks/use-create-product";
import { uploadProductImage } from "@/features/product/utils/upload-image";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useCategories } from "@/features/category/hooks/use-categories";

interface CreateProductFormProps {
    storeSlug: string;
}

export function CreateProductForm({ storeSlug }: CreateProductFormProps) {
    const router = useRouter();
    // const [categories, setCategories] = useState<
    //     { id: string; name: string }[]
    // >([]);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const { mutateAsync, isPending } = useCreateProduct(storeSlug);

    const form = useForm<ProductInput>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            merk: "",
            categoryId: null,
            description: "",
            imageUrl: "",
            isActive: true,
            hasVariants: false,
            variants: [
                {
                    sku: "",
                    price: 0,
                    stock: 0,
                    unit: "pcs",
                    size: "",
                    color: "",
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "variants",
    });

    const [sort, setSort] = useState("createdAt-desc");
    const [sortBy, sortOrder] = sort.split("-") as [
        "name" | "createdAt",
        "asc" | "desc",
    ];
    const { getCategoryListQuery } = useCategories({
        storeSlug,
        sortBy,
        sortOrder,
    });
    const {
        data: categoryListData, // Mengubah properti 'data' menjadi 'categoryListData'
        isLoading: isLoadingCategory, // Mengubah 'isLoading' menjadi 'isLoadingCategory'
        isError: isErrorCategory, // Mengubah 'isError' menjadi 'isErrorCategory'
        error: errorCategory, // Mengubah 'error' menjadi 'errorCategory'
    } = getCategoryListQuery;

    async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
            return;
        }

        const preview = URL.createObjectURL(file);
        setImagePreview(preview);
        form.setValue("imageFile", file);
    }

    async function onSubmit(values: ProductInput) {
        try {
            let imageUrl = values.imageUrl;

            if (values.imageFile && values.imageFile instanceof File) {
                setIsUploading(true);
                imageUrl = await uploadProductImage(values.imageFile);
                setIsUploading(false);
            }

            const submitData = {
                ...values,
                imageUrl,
                imageFile: null,
            };

            const response = await mutateAsync(submitData);
            if (response.success) {
                toast.success("Produk berhasil dibuat!");
                router.push(`/stores/${storeSlug}/products`);
            }
        } catch (error) {
            console.error(error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan saat menyimpan produk.",
            );
        }
    }

    const hasVariants = form.watch("hasVariants");

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                        Nama Produk
                    </label>
                    <Input {...form.register("name")} />
                    {form.formState.errors.name && (
                        <p className="text-xs text-red-500">
                            {form.formState.errors.name.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                        Merk
                    </label>
                    <Input {...form.register("merk")} />
                    {form.formState.errors.merk && (
                        <p className="text-xs text-red-500">
                            {form.formState.errors.merk.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                        Kategori{" "}
                        {
                            <span className="text-xs font-bold text-red-600 ml-4">
                                {errorCategory?.message}
                            </span>
                        }
                    </label>
                    <select
                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                        {...form.register("categoryId")}
                    >
                        <option value="" aria-readonly>
                            Pilih Kategori
                        </option>
                        {categoryListData ? (
                            categoryListData.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))
                        ) : (
                            <option>-</option>
                        )}
                    </select>
                    {form.formState.errors.categoryId && (
                        <p className="text-xs text-red-500">
                            {form.formState.errors.categoryId.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                        Deskripsi
                    </label>
                    <Textarea {...form.register("description")} rows={4} />
                    {form.formState.errors.description && (
                        <p className="text-xs text-red-500">
                            {form.formState.errors.description.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                        Gambar Produk (Maksimal 5MB)
                    </label>
                    <div className="flex flex-col gap-3">
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleImageChange}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                        {imagePreview && (
                            <div className="relative w-32 h-32 rounded-lg border border-slate-200 overflow-hidden">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                    {form.formState.errors.imageFile && (
                        <p className="text-xs text-red-500">
                            {form.formState.errors.imageFile?.message as string}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    {...form.register("hasVariants")}
                    className="h-4 w-4"
                />
                <label className="text-sm font-medium text-slate-700">
                    Produk ini memiliki varian (ukuran, warna, dll)
                </label>
            </div>

            <div className="space-y-4">
                {!hasVariants && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                                SKU
                            </label>
                            <Input {...form.register("variants.0.sku")} />
                            {form.formState.errors.variants?.[0]?.sku && (
                                <p className="text-xs text-red-500">
                                    {
                                        form.formState.errors.variants?.[0]?.sku
                                            ?.message as string
                                    }
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                                Harga
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                {...form.register("variants.0.price", {
                                    valueAsNumber: true,
                                })}
                            />
                            {form.formState.errors.variants?.[0]?.price && (
                                <p className="text-xs text-red-500">
                                    {
                                        form.formState.errors.variants?.[0]
                                            ?.price?.message
                                    }
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                                Stok
                            </label>
                            <Input
                                type="number"
                                {...form.register("variants.0.stock", {
                                    valueAsNumber: true,
                                })}
                            />
                            {form.formState.errors.variants?.[0]?.stock && (
                                <p className="text-xs text-red-500">
                                    {
                                        form.formState.errors.variants?.[0]
                                            ?.stock?.message
                                    }
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {hasVariants && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-700">
                                Varian Produk
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    append({
                                        sku: "",
                                        price: 0,
                                        stock: 0,
                                        unit: "pcs",
                                        size: "",
                                        color: "",
                                    })
                                }
                            >
                                Tambah Varian
                            </Button>
                        </div>
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="rounded-2xl border border-slate-200 p-4"
                            >
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            SKU
                                        </label>
                                        <Input
                                            {...form.register(
                                                `variants.${index}.sku` as const,
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            Harga
                                        </label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            {...form.register(
                                                `variants.${index}.price` as const,
                                                { valueAsNumber: true },
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            Stok
                                        </label>
                                        <Input
                                            type="number"
                                            {...form.register(
                                                `variants.${index}.stock` as const,
                                                { valueAsNumber: true },
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            Unit
                                        </label>
                                        <Input
                                            {...form.register(
                                                `variants.${index}.unit` as const,
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            Ukuran
                                        </label>
                                        <Input
                                            {...form.register(
                                                `variants.${index}.size` as const,
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Warna
                                    </label>
                                    <Input
                                        {...form.register(
                                            `variants.${index}.color` as const,
                                        )}
                                    />
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => remove(index)}
                                    >
                                        Hapus Varian
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    className="h-4 w-4"
                    {...form.register("isActive")}
                />
                <label className="text-sm font-medium text-slate-700">
                    Produk aktif
                </label>
            </div>

            <Button
                type="submit"
                disabled={isPending || isUploading}
                className="w-full"
            >
                {isPending || isUploading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isUploading ? "Mengunggah gambar..." : "Menyimpan..."}
                    </>
                ) : (
                    "Simpan Produk"
                )}
            </Button>
        </form>
    );
}
