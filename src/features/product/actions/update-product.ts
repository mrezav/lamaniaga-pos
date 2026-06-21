"use server";

import { getErrorMessage } from "@/lib/utils";
import { updateProductSchema } from "../schemas/product-schema";
import { updateProduct } from "../repositories/update-product";
import { checkPermission } from "@/lib/permission";
import { getStoreBySlug } from "@/lib/store";
import { UserAction } from "@/types";
import { findProductById } from "../repositories";
import { deleteFileBulk, uploadFile } from "@/lib/storage";

export async function updateproductAction(
    formData: FormData,
    storeSlug: string,
) {
    try {
        const store = await getStoreBySlug(storeSlug);
        await checkPermission(store.id, "product", UserAction.EDIT);

        const fileUpload = formData.get("imageFile") as File | null;
        const documentRaw = formData.get("document") as string;
        const documentData = JSON.parse(documentRaw);
        documentData.storeId = store.id;

        const validation = updateProductSchema.safeParse(documentData);
        if (!validation.success) {
            return {
                success: false,
                validationErrors: validation.error.flatten().fieldErrors,
            };
        }

        // console.log("================== Validation Data ==================");
        // console.log(documentData);
        // console.log(validation.data);
        // console.log("========================================================");

        const product = await findProductById(validation.data.id);
        if (!product) {
            return { success: false, error: "Produk tidak ditemukan" };
        }

        let newImageUrl = product.imageUrl;
        const oldImageurl = product.imageUrl;

        // Proses upload file jika gambar diganti
        if (fileUpload) {
            newImageUrl = await uploadFile(fileUpload, storeSlug, "products");
        } else {
            newImageUrl = null;
        }

        // Update Produk beserta variant
        const updatedProduct = await updateProduct(
            validation.data,
            product.id,
            newImageUrl,
            documentData.deletedVariantIds,
        );

        if (updatedProduct) {
            // Jika proses update berhasil upload gambar baru maka hapus yang lama
            if (newImageUrl) {
                if (oldImageurl) await deleteFileBulk([oldImageurl]);
            }
        } else {
            // Jika proses update data gagal dan gambar baru sudah di upload maka hapus lagi
            if (newImageUrl) await deleteFileBulk([newImageUrl]);
        }

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}
