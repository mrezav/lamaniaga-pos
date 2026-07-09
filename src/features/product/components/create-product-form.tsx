"use client";

import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { useCategoryList } from "@/features/category/hooks/use-categories";
import { useProductMutations } from "../hooks/use-product-mutations";
import ProductVariantsForm from "./product-variant-form";
import { Loader2 } from "lucide-react";

interface CreateProductFormProps {
    storeSlug: string;
}

// Asumsi kondisi awal untuk variants tunggal / default
const defaultVariantValue = [
    {
        sku: "",
        price: 0,
        stock: 0,
        unit: "pcs",
        size: "",
        color: "",
    },
];

export function CreateProductForm({ storeSlug }: CreateProductFormProps) {
    const router = useRouter();
    const [imagePreview, setImagePreview] = useState<string>("");
    const { createProduct, isCreating } = useProductMutations(storeSlug);

    const {
        register,
        handleSubmit,
        reset,
        setError,
        watch,
        setValue,
        getValues,
        control,
        formState: { errors },
    } = useForm<ProductInput>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            merk: "",
            categoryId: "",
            description: "",
            imageUrl: "",
            imageFile: null,
            isActive: true,
            hasVariants: false,
            variants: defaultVariantValue,
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: control,
        name: "variants",
    });

    const hasVariants = watch("hasVariants");
    // const watchVariants = watch("variants");

    // Efek untuk reset data variants ketika switch hasVariants dimatikan (false)
    useEffect(() => {
        if (!hasVariants) {
            // replace(defaultVariantValue);
            reset({
                ...getValues(),
                variants: defaultVariantValue,
            });
        }
    }, [hasVariants, replace]);

    const { data: categoryListData, error: errorCategory } =
        useCategoryList(storeSlug);

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

    async function onSubmit(values: ProductInput) {
        try {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("merk", values.merk);
            formData.append(
                "categoryId",
                values.categoryId ? String(values.categoryId) : "",
            );
            formData.append("description", values.description ?? "");
            formData.append("isActive", String(values.isActive));
            formData.append("hasVariants", String(values.hasVariants));
            formData.append("variants", JSON.stringify(values.variants));

            if (values.imageFile instanceof File) {
                formData.append("imageFile", values.imageFile);
            }

            const response = await createProduct(formData);

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

            toast.success("Produk berhasil dibuat!");
            router.push(`/stores/${storeSlug}/products`);
        } catch (error) {
            console.error(error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan saat menyimpan produk.",
            );
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mx-auto">
            {/* INPUT UTAMA PRODUK */}
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
            </div>

            {/* SEKSI PILIHAN VARIAN (SWITCH) */}
            <div className="flex items-center justify-between bg-teal-50/50 p-4 rounded-2xl border border-teal-100">
                <div className="space-y-0.5">
                    <label
                        htmlFor="hasVariants"
                        className="text-sm font-semibold text-slate-800 cursor-pointer"
                    >
                        Varian Produk
                    </label>
                    <p className="text-xs text-slate-500">
                        Aktifkan jika produk ini memiliki variasi seperti ukuran
                        atau warna.
                    </p>
                </div>
                {/* Komponen Switch Cantik */}
                <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                        id="hasVariants"
                        type="checkbox"
                        className="sr-only peer"
                        {...register("hasVariants")}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
            </div>

            {/* FORM SINGLE VARIANT (Kondisi hasVariants = FALSE) */}
            {!hasVariants && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <p className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
                        Informasi Stok & Harga
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                        <div className="space-y-2">
                            <label className="text-xs font-muted text-slate-600">
                                SKU (Opsional)
                            </label>
                            <Input
                                {...register("variants.0.sku")}
                                placeholder="KA-XH-XXX1"
                                className="focus-visible:ring-teal-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-muted text-slate-600">
                                Harga
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                {...register("variants.0.price", {
                                    valueAsNumber: true,
                                })}
                                className="focus-visible:ring-teal-500"
                            />
                            {errors.variants?.[0]?.price && (
                                <p className="text-xs text-red-500">
                                    {errors.variants?.[0]?.price?.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-muted text-slate-600">
                                Stok
                            </label>
                            <Input
                                type="number"
                                {...register("variants.0.stock", {
                                    valueAsNumber: true,
                                })}
                                className="focus-visible:ring-teal-500"
                            />
                            {errors.variants?.[0]?.stock && (
                                <p className="text-xs text-red-500">
                                    {errors.variants?.[0]?.stock?.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-muted text-slate-600">
                                Unit
                            </label>
                            <Input
                                {...register("variants.0.unit")}
                                className="focus-visible:ring-teal-500"
                            />
                            {errors.variants?.[0]?.stock && (
                                <p className="text-xs text-red-500">
                                    {errors.variants?.[0]?.unit?.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-muted text-slate-600">
                                Ukuran (Opsional)
                            </label>
                            <Input
                                {...register("variants.0.size")}
                                placeholder="L/XL"
                                className="focus-visible:ring-teal-500"
                            />
                            {errors.variants?.[0]?.size && (
                                <p className="text-xs text-red-500">
                                    {errors.variants?.[0]?.size?.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-muted text-slate-600">
                                Warna (Opsional)
                            </label>
                            <Input
                                {...register("variants.0.color")}
                                placeholder="Hitam"
                                className="focus-visible:ring-teal-500"
                            />
                            {errors.variants?.[0]?.color && (
                                <p className="text-xs text-red-500">
                                    {errors.variants?.[0]?.color?.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* FORM MULTIPLE VARIANTS (Kondisi hasVariants = TRUE) */}
            {hasVariants && (
                <ProductVariantsForm
                    control={control}
                    register={register}
                    errors={errors}
                />
            )}

            {/* SWITCH AKTIF / MATI PRODUK */}
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm w-fit">
                <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        {...register("isActive")}
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
                <span className="text-sm font-medium text-slate-700">
                    Tampilkan produk di toko (Aktif)
                </span>
            </div>

            {/* ACTIONS BUTTON */}
            <Button
                type="submit"
                disabled={isCreating}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white h-11 rounded-xl font-medium transition shadow-sm"
            >
                {isCreating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan ke sistem...
                    </>
                ) : (
                    "Simpan Informasi Produk"
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
