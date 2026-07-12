"use server";

import { getStoreBySlug } from "@/lib/store";
import { checkPermission } from "@/lib/permission";
import { UserAction } from "@/types";
import { productSchema } from "@/features/product/schemas/product-schema";
import { generateProductSlug } from "@/features/product/utils/generate-slug";
import {
    createProduct,
    createProductVariants,
} from "@/features/product/repositories";
import { revalidatePath } from "next/cache";
import { generateSku, getErrorMessage } from "@/utils";
import { deleteFileBulk, uploadFile } from "@/lib/storage";
import { db } from "@/db";

export async function createProductAction(
    formData: FormData,
    storeSlug: string,
) {
    try {
        const store = await getStoreBySlug(storeSlug);
        if (!store) {
            return { success: false, error: "Toko tidak ditemukan." };
        }
        await checkPermission(store.id, "product", UserAction.CREATE);

        // Menangkap data yang dikirim hooks dalam bentuk FormData
        const rawVariants = formData.get("variants") as string;
        const rawCategory = formData.get("categoryId") as string;
        const rawDescription = formData.get("description") as string;
        const rawData = {
            name: formData.get("name") as string,
            merk: formData.get("merk") as string,
            categoryId:
                rawCategory &&
                rawCategory.trim() !== "" &&
                rawCategory !== "null"
                    ? rawCategory
                    : null,
            description: rawDescription === "" ? null : rawDescription,
            isActive: formData.get("isActive") === "true", // ubah string "true" ke boolean true
            hasVariants: formData.get("hasVariants") === "true",
            variants: rawVariants ? JSON.parse(rawVariants) : [], // kembalikan string JSON ke array
            imageFile: formData.get("imageFile") as File | null,
        };

        // console.log("================== DATA MASUK DARI UI ==================");
        // console.log(rawData);
        // console.log("========================================================");

        // --- STEP 2: VALIDASI MENGGUNAKAN ZOD ---
        const validation = productSchema.safeParse(rawData);
        if (!validation.success) {
            return {
                success: false,
                validationErrors: validation.error.flatten().fieldErrors,
            };
        }

        // Proses Upload Image
        const imageUrl = await uploadFile(
            rawData.imageFile,
            storeSlug,
            "products",
        );

        const data = validation.data;
        const productSlug = await generateProductSlug(data.name, store.id);

        // 1. Bungkus seluruh proses penulisan DB ke dalam db.transaction
        const result = await db.transaction(async (tx) => {
            // Pastikan fungsi createProduct Anda menerima parameter `tx` opsional di dalamnya,
            // Contoh internalnya: (payload) => tx.insert(products).values(payload)...
            const product = await createProduct(
                {
                    name: data.name,
                    merk: data.merk,
                    slug: productSlug,
                    description: data.description ?? null,
                    categoryId: data.categoryId ?? null,
                    imageUrl: imageUrl ?? null,
                    isActive: data.isActive,
                    storeId: store.id,
                },
                tx,
            ); // 👈 OPER `tx` KE SINI

            const defaultVariant = data.variants[0];

            const variantPayloads = data.hasVariants
                ? data.variants.map((variant) => {
                      // Jika user tidak isi SKU, otomatis generate lewat nama toko & produk
                      const finalSku =
                          variant.sku && variant.sku.trim() !== ""
                              ? variant.sku
                              : generateSku(data.name, data.merk);

                      return {
                          productId: product.id,
                          sku: finalSku,
                          price: variant.price.toString(),
                          stock: variant.stock.toString(),
                          unit: variant.unit,
                          attributes: {
                              size: variant.size || "",
                              color: variant.color || "",
                          },
                          storeId: store.id,
                      };
                  })
                : [
                      {
                          productId: product.id,
                          // Fallback auto-generate untuk default variant
                          sku:
                              defaultVariant?.sku &&
                              defaultVariant.sku.trim() !== ""
                                  ? defaultVariant.sku
                                  : generateSku(data.name, data.merk),
                          price: (defaultVariant?.price ?? 0).toString(),
                          stock: (defaultVariant?.stock ?? 0).toString(),
                          unit: defaultVariant?.unit || "pcs",
                          attributes: {
                              size: defaultVariant?.size || "",
                              color: defaultVariant?.color || "",
                          },
                          storeId: store.id,
                      },
                  ];

            // Oper `tx` ke fungsi create variants agar dieksekusi di transaksi yang sama
            return await createProductVariants(variantPayloads, tx); // 👈 OPER `tx` KE SINI
        });

        //  Hapus image produk jika insert data gagal
        if (!result && imageUrl) {
            await deleteFileBulk([imageUrl]);
        }

        // 2. Revalidate dipanggil DI LUAR transaksi setelah dipastikan sukses commit
        revalidatePath(`/stores/${storeSlug}/products`);

        return { success: true };
    } catch (error: unknown) {
        console.error(getErrorMessage(error));
        // Tambahkan catch block agar penanganan error asinkronus lebih aman
        return { success: false, error: "terjadi kesalahan internal" };
    }
}
