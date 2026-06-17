import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const BUCKET_NAME = "public-assets";
const STORAGE_PATH = "products";

export async function uploadProductImage(file: File): Promise<string | null> {
    if (!file) return null;

    if (file.size > MAX_FILE_SIZE) {
        throw new Error("Ukuran file terlalu besar. Maksimal 5MB.");
    }

    const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
    ];
    if (!validImageTypes.includes(file.type)) {
        throw new Error(
            "Format file tidak didukung. Gunakan JPEG, PNG, WebP, atau GIF.",
        );
    }

    const supabase = createClient();
    const timestamp = Date.now();
    const fileName = `product-${timestamp}.${file.name.split(".").pop()}`;
    const filePath = `${STORAGE_PATH}/${fileName}`;

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
