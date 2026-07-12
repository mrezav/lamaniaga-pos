/**
 * Mengubah huruf pertama pada teks menjadi Kapital (Capitalize First Letter)
 */
export function capitalizeText(text: string): string {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function parseIndonesianNumber(text: string): number {
    if (!text) return 0;

    // 1. Standardisasi teks ke huruf kecil dan bersihkan spasi di ujung
    let cleanText = text.toLowerCase().trim();

    // 2. BERSIHKAN "Rp" DAN TITIK: Menangani "Rp20.000" atau "rp. 25.000"
    cleanText = cleanText
        .replace(/rp\.?/g, "") // Menghapus "rp" atau "rp."
        .replace(/\./g, "") // Menghapus titik pemisah ribuan (20.000 -> 20000)
        .replace(/,/g, "") // Jaga-jaga jika browser memakai format koma
        .trim();

    // 3. TANGANI FORMAT CAMPURAN: Menangani "20 ribu" atau "1.5 juta" (setelah titik dihapus)
    // Catatan: Jika teksnya "20 ribu", maka cleanText saat ini adalah "20 ribu"
    if (cleanText.includes("juta")) {
        const parts = cleanText.split("juta");
        const num = parseFloat(parts[0].trim()) || 0;
        return num * 1000000;
    }

    if (cleanText.includes("ribu")) {
        const parts = cleanText.split("ribu");
        const num = parseFloat(parts[0].trim()) || 0;
        return num * 1000;
    }

    if (cleanText.includes("ratus")) {
        const parts = cleanText.split("ratus");
        const num = parseFloat(parts[0].trim()) || 0;
        return num * 100;
    }

    // 4. JIKA SUDAH JADI ANGKA MURNI (misal dari "Rp20.000" -> "20000")
    if (!isNaN(Number(cleanText)) && cleanText !== "") {
        return Number(cleanText);
    }

    // 5. FALLBACK: Jika teksnya benar-benar murni kata-kata (misal: "dua puluh ribu")
    // Panggil fungsi konversi kata-ke-angka bawaan yang sudah kamu buat sebelumnya
    return convertCurrencyText(cleanText);
}
/**
 * Mengonversi ucapan angka berbahasa Indonesia menjadi angka numerik asli.
 * Contoh: "dua puluh lima ribu" -> 25000
 * Contoh Kode Barcode: "delapan delapan lima satu" -> 8851
 */
export function convertCurrencyText(text: string): number {
    if (!text) return 0;

    // 1. Bersihkan teks dari kata-kata yang tidak diperlukan
    let cleaned = text
        .toLowerCase()
        .replace(/rupiah/g, "")
        .replace(/per/g, "")
        .replace(/botol|pcs|buah|pack|box/g, "") // Bersihkan satuan jika kasir tidak sengaja menyebutkannya
        .trim();

    // 2. Kasus Khusus: Jika kasir menyebutkan deretan angka langsung (misal untuk Barcode/SKU)
    // Contoh: "8 8 5 1" atau "delapan delapan lima satu"
    const digitMap: Record<string, string> = {
        nol: "0",
        kosong: "0",
        satu: "1",
        dua: "2",
        tiga: "3",
        empat: "4",
        lima: "5",
        enam: "6",
        tujuh: "7",
        delapan: "8",
        sembilan: "9",
    };

    const words = cleaned.split(/\s+/);

    // Periksa apakah isi kalimat HANYA berupa deretan angka satuan saja
    const isRawDigits = words.every(
        (word) => Object.keys(digitMap).includes(word) || /^\d+$/.test(word),
    );

    if (isRawDigits) {
        const parsedDigits = words
            .map((word) => digitMap[word] || word)
            .join("");
        return Number(parsedDigits) || 0;
    }

    // 3. Kasus Standar: Konversi angka nominal/terbilang (Harga & Stok)
    // Normalisasi prefiks "se-" agar menjadi "satu " agar polanya konsisten
    cleaned = cleaned
        .replace(/sebelas/g, "11") // penanganan khusus belasan
        .replace(/sepuluh/g, "satu puluh")
        .replace(/seratus/g, "satu ratus")
        .replace(/seribu/g, "satu ribu")
        .replace(/sejuta/g, "satu juta");

    const unitMap: Record<string, number> = {
        nol: 0,
        satu: 1,
        dua: 2,
        tiga: 3,
        empat: 4,
        lima: 5,
        enam: 6,
        tujuh: 7,
        delapan: 8,
        sembilan: 9,
        "11": 11,
    };

    let totalSum = 0;
    let currentAccumulator = 0;

    const tokens = cleaned.split(/\s+/);

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (unitMap[token] !== undefined) {
            currentAccumulator += unitMap[token];
        } else if (token === "belas") {
            currentAccumulator += 10;
        } else if (token === "puluh") {
            currentAccumulator *= 10;
        } else if (token === "ratus") {
            currentAccumulator *= 100;
        } else if (token === "ribu") {
            totalSum += currentAccumulator * 1000;
            currentAccumulator = 0; // Reset akumulator setelah pengali besar
        } else if (token === "juta") {
            totalSum += currentAccumulator * 1000000;
            currentAccumulator = 0;
        } else if (/^\d+$/.test(token)) {
            // Jika browser langsung menangkap dalam bentuk angka digital murni (cth: "20", "500")
            currentAccumulator += Number(token);
        }
    }

    totalSum += currentAccumulator;
    return totalSum;
}
