import { checkCategorySlugExists } from "../repositories";

/**
 * Mengubah string teks menjadi format slug standar URL friendly.
 */
const convertToSlug = (text: string): string => {
    return text
        .toLocaleLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // Ganti spasi/simbol dengan tanda dash (-)
        .replace(/(^-|-$)+/g, ""); // Hapus tanda dash di awal atau akhir teks
};

/**
 * Membuat 3 digit string alfanumerik acak (Contoh: "a3f", "7x1").
 */
const generateRandomSuffix = (): string => {
    return Math.random().toString(36).substring(2, 5);
};

/**
 * Menghasilkan slug kategori yang dijamin mutlak unik per Store.
 * Memanfaatkan looping safety jika kode acak berturut-turut ternyata bertabrakan di DB.
 */
export async function generateCategorySlug(
    name: string,
    storeId: string,
): Promise<string> {
    const baseSlug = convertToSlug(name);

    // 1. Cek pertama kali ke database menggunakan db.select ringan
    let currentSlug = baseSlug;
    let isSlugTaken = await checkCategorySlugExists(currentSlug, storeId);

    // 2. Jika slug dasar belum ada yang pakai di store ini, langsung return
    if (!isSlugTaken) return currentSlug;

    // 3. JIKA SUDAH DIPAKAI: Masuk ke mode perlindungan loop
    // Loop ini akan terus berputar hingga db.select mengembalikan 'false' (belum ada yang pakai)
    while (isSlugTaken) {
        const suffix = generateRandomSuffix();
        currentSlug = `${baseSlug}-${suffix}`; // Menggabungkan base slug + suffix acak

        // Periksa kembali slug baru ini ke database
        isSlugTaken = await checkCategorySlugExists(currentSlug, storeId);
    }

    // 4. Return slug yang dijamin 100% aman dan unik
    return currentSlug;
}
