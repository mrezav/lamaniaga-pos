import {
    Control,
    UseFormRegister,
    FieldErrors,
    FieldValues,
    useFieldArray,
    FieldArrayPath,
    FieldPath,
    FieldArray,
} from "react-hook-form";

interface ProductVariantsFormProps<T extends FieldValues> {
    control: Control<T>;
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
    onVariantDelete?: (id: string) => void;
}

// 1. Biarkan T murni extends FieldValues agar Parent bisa melakukan inferensi dengan sempurna
export default function ProductVariantForm<T extends FieldValues>({
    control,
    register,
    errors,
    onVariantDelete,
}: ProductVariantsFormProps<T>) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "variants" as FieldArrayPath<T>,
    });

    const handleRemove = (index: number) => {
        const currentVariant = control._formValues.variants?.[index];
        if (currentVariant?.id && onVariantDelete) {
            onVariantDelete(currentVariant.id); // Kirim ID ke parent!
        }
        remove(index);
    };

    // 2. Ubah errors menjadi Record agar kita bisa membaca property 'variants'
    // tanpa komplain dari TypeScript dan tanpa menggunakan 'any'
    const errorsRecord = errors as Record<string, unknown>;
    const totalVariantsErrors = errorsRecord.variants as
        | Array<Record<string, { message?: string }> | undefined>
        | undefined;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                    Daftar Variasi Produk
                </h3>
                <button
                    type="button"
                    onClick={() =>
                        // 3. Gunakan kombinasi 'as unknown as FieldArray<...>' untuk append objek baru
                        append({
                            sku: "",
                            price: 0,
                            stock: 0,
                            unit: "pcs",
                            size: "",
                            color: "",
                        } as unknown as FieldArray<T, FieldArrayPath<T>>)
                    }
                    className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    + Tambah Varian
                </button>
            </div>

            {/* Loop Item Varian */}
            {fields.map((field, index) => {
                // 4. Ambil error spesifik berdasarkan index saat ini dari variabel aman kita
                const variantErrors = totalVariantsErrors?.[index];

                return (
                    <div
                        key={field.id}
                        className="rounded-2xl border-2 border-teal-400 bg-white p-5 shadow-sm hover:shadow-md transition relative overflow-hidden"
                    >
                        {/* Ribbon Penanda Varian */}
                        <div className="absolute top-0 left-0 bg-teal-400 text-white text-[10px] font-bold px-3 py-1 rounded-br-xl">
                            Varian #{index + 1}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                            {/* Input SKU */}
                            <div>
                                <label className="text-xs font-medium text-gray-600">
                                    SKU
                                </label>
                                <input
                                    {...register(
                                        `variants.${index}.sku` as FieldPath<T>,
                                    )}
                                    placeholder="Contoh: COK-XL"
                                    className="border border-gray-300 p-2 w-full rounded-md text-sm mt-1 outline-none"
                                />
                                {variantErrors?.sku?.message && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {variantErrors.sku.message}
                                    </p>
                                )}
                            </div>

                            {/* Input Harga */}
                            <div>
                                <label className="text-xs font-medium text-gray-600">
                                    Harga
                                </label>
                                <input
                                    type="number"
                                    {...register(
                                        `variants.${index}.price` as FieldPath<T>,
                                        { valueAsNumber: true },
                                    )}
                                    placeholder="0"
                                    className="border border-gray-300 p-2 w-full rounded-md text-sm mt-1 outline-none"
                                />
                                {variantErrors?.price?.message && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {variantErrors.price.message}
                                    </p>
                                )}
                            </div>

                            {/* Input Stok */}
                            <div>
                                <label className="text-xs font-medium text-gray-600">
                                    Stok
                                </label>
                                <input
                                    type="number"
                                    {...register(
                                        `variants.${index}.stock` as FieldPath<T>,
                                        { valueAsNumber: true },
                                    )}
                                    placeholder="0"
                                    className="border border-gray-300 p-2 w-full rounded-md text-sm mt-1 outline-none"
                                />
                                {variantErrors?.stock?.message && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {variantErrors.stock.message}
                                    </p>
                                )}
                            </div>

                            {/* Input Unit */}
                            <div>
                                <label className="text-xs font-medium text-gray-600">
                                    Unit
                                </label>
                                <input
                                    {...register(
                                        `variants.${index}.unit` as FieldPath<T>,
                                    )}
                                    placeholder="pcs"
                                    className="border border-gray-300 p-2 w-full rounded-md text-sm mt-1 outline-none"
                                />
                                {variantErrors?.unit?.message && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {variantErrors.unit.message}
                                    </p>
                                )}
                            </div>

                            {/* Input Ukuran */}
                            <div>
                                <label className="text-xs font-medium text-gray-600">
                                    Ukuran (Opsional)
                                </label>
                                <input
                                    {...register(
                                        `variants.${index}.size` as FieldPath<T>,
                                    )}
                                    placeholder="L / XL"
                                    className="border border-gray-300 p-2 w-full rounded-md text-sm mt-1 outline-none"
                                />
                            </div>

                            {/* Input Warna */}
                            <div>
                                <label className="text-xs font-medium text-gray-600">
                                    Warna (Opsional)
                                </label>
                                <input
                                    {...register(
                                        `variants.${index}.color` as FieldPath<T>,
                                    )}
                                    placeholder="Hitam"
                                    className="border border-gray-300 p-2 w-full rounded-md text-sm mt-1 outline-none"
                                />
                            </div>
                        </div>

                        <div
                            className="flex justify-end pt-1"
                            hidden={fields.length <= 1}
                        >
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="text-xs text-red-500 hover:text-red-700 font-medium transition"
                                disabled={fields.length === 1}
                            >
                                Hapus Varian
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
