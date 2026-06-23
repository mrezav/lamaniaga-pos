import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "public-assets";

export async function uploadFile(
    file: File | null,
    storeSlug: string,
    storagePath: string,
): Promise<string | null> {
    if (!file) return null;
    const supabase = await createClient();
    const timestamp = Date.now();
    const fileName = `${storagePath}-${timestamp}.${file.name.split(".").pop()}`;
    const filePath = `${storeSlug}/${storagePath}/${fileName}`;

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

export async function deleteFileBulk(imageUrls: string[]) {
    if (imageUrls.length <= 0) return null;
    const imagePaths = imageUrls.map((url) => url.split(`${BUCKET_NAME}/`)[1]);
    const supabase = await createClient();
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(imagePaths);
    if (error) {
        console.error("Delete File Error :", error);
        throw new Error(`Proses menghapus file gagal : ${error.message}`);
    }
    return data;
}
