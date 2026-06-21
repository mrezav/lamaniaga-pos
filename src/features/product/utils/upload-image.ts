import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "public-assets";
const STORAGE_PATH = "products";

export async function uploadProductImage(
    file: File | null,
    storeSlug: string,
): Promise<string | null> {
    if (!file) return null;

    const supabase = await createClient();
    const timestamp = Date.now();
    const fileName = `product-${timestamp}.${file.name.split(".").pop()}`;
    const filePath = `${storeSlug}/${STORAGE_PATH}/${fileName}`;

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, { upsert: false });

    if (error) {
        console.error("Upload error:", error);
        throw new Error(`Gagal mengunggah gambar: ${error.message}`);
    }

    const { data: publicData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

    return publicData.publicUrl;
}
