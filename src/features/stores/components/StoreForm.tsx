"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    createStoreSchema,
    type CreateStoreSchemaType,
} from "../schemas/store-schema";
import {
    generateUniqueSlug,
    createStoreTransaction,
} from "../services/store-actions";
import { useToastStore } from "@/store/useToastStore";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import {
    Loader2,
    Store,
    UploadCloud,
    MapPin,
    Phone,
    Image as ImageIcon,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoreFormProps {
    userId: string;
}

export function StoreForm({ userId }: StoreFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const { showToast } = useToastStore();

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [isCheckingSlug, setIsCheckingSlug] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CreateStoreSchemaType>({
        resolver: zodResolver(createStoreSchema),
        defaultValues: {
            name: "",
            slug: "",
            address: "",
            phoneNumber: "",
        },
    });

    const nameValue = watch("name");
    const slugValue = watch("slug");

    // Auto-generate slug from name in real-time with 500ms debounce
    useEffect(() => {
        if (!nameValue || nameValue.trim().length < 3) {
            setValue("slug", "");
            return;
        }

        const handler = setTimeout(async () => {
            setIsCheckingSlug(true);
            try {
                const uniqueSlug = await generateUniqueSlug(nameValue);
                setValue("slug", uniqueSlug, { shouldValidate: true });
            } catch (error) {
                console.error("Gagal men-generate slug:", error);
            } finally {
                setIsCheckingSlug(false);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [nameValue, setValue]);

    // Mutation for uploading images and saving store data
    const mutation = useMutation({
        mutationFn: async (values: CreateStoreSchemaType) => {
            let logoUrl = "";
            let bannerUrl = "";
            const uploadedPaths: string[] = [];

            try {
                // 1. Upload Logo if provided
                if (values.logo instanceof File) {
                    const ext = values.logo.name.split(".").pop();
                    const path = `${values.slug}/logo-${Date.now()}.${ext}`;
                    const { data: logoData, error: uploadErr } =
                        await supabase.storage
                            .from("public-assets")
                            .upload(path, values.logo, { upsert: true });

                    if (uploadErr) {
                        throw new Error(
                            `Gagal mengunggah logo: ${uploadErr.message}`,
                        );
                    }

                    uploadedPaths.push(logoData.path);
                    const { data } = supabase.storage
                        .from("public-assets")
                        .getPublicUrl(logoData.path);
                    logoUrl = data.publicUrl;
                }

                // 2. Upload Banner if provided
                if (values.banner instanceof File) {
                    const ext = values.banner.name.split(".").pop();
                    const path = `${values.slug}/banner-${Date.now()}.${ext}`;
                    const { data: bannerData, error: uploadErr } =
                        await supabase.storage
                            .from("public-assets")
                            .upload(path, values.banner, { upsert: true });

                    if (uploadErr) {
                        throw new Error(
                            `Gagal mengunggah banner: ${uploadErr.message}`,
                        );
                    }

                    uploadedPaths.push(bannerData.path);
                    const { data } = supabase.storage
                        .from("public-assets")
                        .getPublicUrl(bannerData.path);
                    bannerUrl = data.publicUrl;
                }

                // 3. Insert Store & Update Profile
                const result = await createStoreTransaction({
                    name: values.name,
                    slug: values.slug,
                    address: values.address || undefined,
                    phoneNumber: values.phoneNumber || undefined,
                    logoUrl: logoUrl || undefined,
                    bannerUrl: bannerUrl || undefined,
                    ownerId: userId,
                });

                if (result.error) {
                    throw new Error(result.error);
                }

                return result.data;
            } catch (err: any) {
                // Rollback / clean up uploaded files if transaction failed
                if (uploadedPaths.length > 0) {
                    await supabase.storage.from("stores").remove(uploadedPaths);
                }
                throw err;
            }
        },
        onSuccess: (data) => {
            showToast(
                "Toko berhasil dibuat! Mengalihkan ke dashboard...",
                "success",
            );
            router.push("/dashboard");
            router.refresh();
        },
        onError: (error: any) => {
            showToast(
                error.message || "Gagal membuat toko. Silakan coba kembali.",
                "error",
            );
        },
    });

    const onSubmit = (data: CreateStoreSchemaType) => {
        mutation.mutate(data);
    };

    // Handle Logo Upload Change
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue("logo", file, { shouldValidate: true });
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle Banner Upload Change
    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue("banner", file, { shouldValidate: true });
            const reader = new FileReader();
            reader.onloadend = () => {
                setBannerPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const isLoading = mutation.isPending;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Banner Upload Area */}
            <div className="relative h-48 w-full rounded-2xl bg-slate-100 border border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center group transition-colors hover:bg-slate-50/50">
                {bannerPreview ? (
                    <>
                        <img
                            src={bannerPreview}
                            alt="Banner Preview"
                            className="w-full h-full object-cover"
                        />
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-semibold gap-2">
                            <UploadCloud className="w-5 h-5" />
                            Ganti Banner Toko
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleBannerChange}
                                disabled={isLoading}
                            />
                        </label>
                    </>
                ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full p-6 text-slate-500">
                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="font-semibold text-sm">
                            Unggah Banner Toko
                        </span>
                        <span className="text-xs text-slate-400 mt-1">
                            Format gambar (Maks. 5MB)
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleBannerChange}
                            disabled={isLoading}
                        />
                    </label>
                )}
                {errors.banner && (
                    <span className="absolute bottom-2 right-2 px-2 py-1 bg-red-50 text-red-600 text-xs rounded border border-red-100">
                        {errors.banner.message as string}
                    </span>
                )}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column: Logo & Slug Preview */}
                <div className="space-y-6 flex flex-col items-center">
                    <div className="relative w-40 h-40 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center overflow-hidden group">
                        {logoPreview ? (
                            <>
                                <img
                                    src={logoPreview}
                                    alt="Logo Preview"
                                    className="w-full h-full object-cover"
                                />
                                <label className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-semibold gap-1">
                                    <UploadCloud className="w-4 h-4" />
                                    Ganti Logo
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoChange}
                                        disabled={isLoading}
                                    />
                                </label>
                            </>
                        ) : (
                            <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full p-4 text-slate-400 hover:bg-slate-50/50 transition-colors">
                                <Store className="w-12 h-12 text-slate-300 mb-1" />
                                <span className="text-xs font-medium text-center">
                                    Pilih Logo
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleLogoChange}
                                    disabled={isLoading}
                                />
                            </label>
                        )}
                        {errors.logo && (
                            <span className="absolute bottom-2 px-2 py-0.5 bg-red-50 text-red-600 text-[10px] rounded border border-red-100">
                                {errors.logo.message as string}
                            </span>
                        )}
                    </div>

                    <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-500" />{" "}
                            Auto-Generated Slug
                        </h3>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                {...register("slug")}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-100 text-slate-600 font-mono text-sm outline-none cursor-not-allowed"
                                placeholder="slug-toko-anda"
                            />
                            {isCheckingSlug && (
                                <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                            )}
                        </div>
                        {errors.slug && (
                            <p className="text-xs text-red-600 font-medium leading-relaxed">
                                {errors.slug.message}
                            </p>
                        )}
                        <p className="text-[10px] text-slate-400">
                            *Slug dihasilkan otomatis berdasarkan Nama Toko Anda
                            dan divalidasi keunikannya.
                        </p>
                    </div>
                </div>

                {/* Right Column: Store Details */}
                <div className="md:col-span-2 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">
                            Nama Toko <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            {...register("name")}
                            disabled={isLoading}
                            className={`w-full px-4 py-3 border rounded-xl outline-none transition-all bg-slate-50/50 font-medium ${
                                errors.name
                                    ? "border-red-300 focus:ring-2 focus:ring-red-200"
                                    : "border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            }`}
                            placeholder="Contoh: Toko Sejahtera Sentosa"
                        />
                        {errors.name && (
                            <p className="text-xs text-red-600 font-medium leading-relaxed">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                            <Phone className="w-4 h-4 text-slate-400" /> Nomor
                            Telepon
                        </label>
                        <input
                            type="text"
                            {...register("phoneNumber")}
                            disabled={isLoading}
                            className={`w-full px-4 py-3 border rounded-xl outline-none transition-all bg-slate-50/50 font-medium ${
                                errors.phoneNumber
                                    ? "border-red-300 focus:ring-2 focus:ring-red-200"
                                    : "border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            }`}
                            placeholder="Contoh: 08123456789"
                        />
                        {errors.phoneNumber && (
                            <p className="text-xs text-red-600 font-medium leading-relaxed">
                                {errors.phoneNumber.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-slate-400" /> Alamat
                            Lengkap
                        </label>
                        <textarea
                            rows={4}
                            {...register("address")}
                            disabled={isLoading}
                            className={`w-full px-4 py-3 border rounded-xl outline-none transition-all bg-slate-50/50 font-medium resize-none ${
                                errors.address
                                    ? "border-red-300 focus:ring-2 focus:ring-red-200"
                                    : "border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            }`}
                            placeholder="Tulis alamat toko Anda secara rinci di sini..."
                        />
                        {errors.address && (
                            <p className="text-xs text-red-600 font-medium leading-relaxed">
                                {errors.address.message}
                            </p>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/dashboard")}
                            disabled={isLoading}
                            className="flex-1 h-12 rounded-xl text-base font-semibold border-slate-200 hover:bg-slate-50 text-slate-600"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || isCheckingSlug || !slugValue}
                            className="flex-[2] h-12 rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 hover:shadow-blue-200 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Memproses Toko...
                                </>
                            ) : (
                                "Buat Toko Sekarang"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
