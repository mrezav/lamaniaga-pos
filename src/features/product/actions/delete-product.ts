"use server";

import { checkPermission } from "@/lib/permission";
import { getStoreBySlug } from "@/lib/store";
import { UserAction } from "@/types";
import { deleteProduct, findProductById } from "../repositories";
import { getErrorMessage } from "@/lib/utils";
import { deleteFileBulk } from "@/lib/storage";

export async function deleteProductAction(
    storeSlug: string,
    productId: string,
) {
    try {
        const store = await getStoreBySlug(storeSlug);
        await checkPermission(store.id, "product", UserAction.DELETE);
        const product = await findProductById(productId);
        if (!product) {
            return { success: false, error: "Produk tidak ditemukan" };
        }
        const result = await deleteProduct(productId);
        if (!result) {
            return { success: false, error: "Gagal menghapus produk" };
        }
        if (product.imageUrl != null) {
            deleteFileBulk([product.imageUrl]);
        }
        return { success: true, data: result[0] };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error) };
    }
}
