import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Hapus karakter non-alfanumerik kecuali spasi dan tanda hubung
        .replace(/[\s_-]+/g, "-") // Ganti spasi atau underscore menjadi satu tanda hubung
        .replace(/^-+|-+$/g, ""); // Hapus tanda hubung di awal/akhir teks
}
