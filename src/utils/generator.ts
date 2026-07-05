import { randomInt } from "node:crypto";
export function generateRandomCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 9; i++) {
        result += chars.charAt(randomInt(0, chars.length));
    }
    return result;
}

// Daftar kata fonetik 4 huruf yang mudah dieja dan terdengar modern
const PHONETIC_WORDS = [
    "NEXA",
    "ALFA",
    "ZEST",
    "VECT",
    "NASA",
    "ZETA",
    "AXIS",
    "APEX",
    "CORE",
    "FLUX",
    "SPARK",
    "ECHO",
    "CYAN",
    "ONYX",
    "RYTH",
    "VIBE",
];

/**
 * Menghasilkan nomor Invoice unik yang human-friendly berbasis tanggal.
 * Format Hasil: INV/YYMMDD/KATA-ANGKA (Contoh: INV/260702/NEXA-4812)
 *
 * @param counter Optional: Jika ada nomor urut dari DB (misal: auto-increment id)
 *                untuk menjamin 100% keunikan tanpa tabrakan di detik yang sama.
 */
export function generateInvoiceId(counter?: number): string {
    const now = new Date();

    // 1. Ambil format YYMMDD
    const year = String(now.getFullYear()).slice(-2); // "26"
    const month = String(now.getMonth() + 1).padStart(2, "0"); // "07"
    const day = String(now.getDate()).padStart(2, "0"); // "02"
    const dateStr = `${year}${month}${day}`; // "260702"

    // 2. Pilih kata acak dari daftar fonetik
    const randomIndex = Math.floor(Math.random() * PHONETIC_WORDS.length);
    const word = PHONETIC_WORDS[randomIndex];

    // 3. Tentukan suffix angka (4 digit)
    let suffix: string;
    if (counter !== undefined) {
        // Jika menggunakan increment DB, pad dengan nol (misal: id 12 -> "0012")
        // Menggunakan modulo 10000 agar panjangnya tetap maksimal 4 digit
        suffix = String(counter % 10000).padStart(4, "0");
    } else {
        // Jika tanpa DB counter, buat angka acak 4 digit (1000 - 9999)
        suffix = String(Math.floor(1000 + Math.random() * 9000));
    }

    // 4. Gabungkan menjadi format final
    return `INV/${dateStr}/${word}-${suffix}`;
}

import { customAlphabet } from "nanoid";

export function generateSku(storeName: string, productName: string): string {
    // Ambil 3-4 karakter pertama, hapus spasi/karakter spesial, jadikan uppercase
    const cleanStore = storeName
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 2)
        .toUpperCase();
    const cleanProduct = productName
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 3)
        .toUpperCase();

    // Generate 3 karakter random alfanumerik unik (menggunakan nanoid/crypto)
    const nanoid = customAlphabet("1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", 4);
    const randomStr = nanoid();

    return `${cleanStore}-${cleanProduct}-${randomStr}`;
}
