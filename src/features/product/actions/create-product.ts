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
import { getErrorMessage } from "@/lib/utils";
import { uploadFile } from "@/lib/storage";

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

        // TODO: HARUS MENGGUNAKAN TX AGAR DATA DI ROLLBACK SAAT TERJADI ERROR
        const product = await createProduct({
            name: data.name,
            merk: data.merk,
            slug: productSlug,
            description: data.description ?? null,
            categoryId: data.categoryId ?? null,
            imageUrl: imageUrl ?? null,
            isActive: data.isActive,
            storeId: store.id,
        });

        // Ambil variant pertama sebagai fallback jika tidak memiliki varian khusus
        const defaultVariant = data.variants[0];

        const variantPayloads = data.hasVariants
            ? data.variants.map((variant) => ({
                  productId: product.id,
                  sku: variant.sku,
                  price: variant.price.toString(), // 👈 KUNCI: Konversi number ke string untuk Drizzle decimal
                  stock: variant.stock,
                  unit: variant.unit,
                  attributes: {
                      size: variant.size || "",
                      color: variant.color || "",
                  },
                  storeId: store.id,
              }))
            : [
                  {
                      productId: product.id,
                      sku: defaultVariant?.sku || "",
                      price: (defaultVariant?.price ?? 0).toString(), // 👈 KUNCI: Konversi number ke string
                      stock: defaultVariant?.stock ?? 0,
                      unit: defaultVariant?.unit || "pcs",
                      attributes: {
                          size: defaultVariant?.size || "",
                          color: defaultVariant?.color || "",
                      },
                      storeId: store.id,
                  },
              ];

        // Sekarang variantPayloads dijamin 100% klop dengan tipe NewVariantInput[]
        await createProductVariants(variantPayloads);

        revalidatePath(`/stores/${storeSlug}/products`);

        return { success: true };
    } catch (error: unknown) {
        // Tambahkan catch block agar penanganan error asinkronus lebih aman
        return { success: false, error: getErrorMessage(error) };
    }
}
