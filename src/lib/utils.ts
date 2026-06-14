import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { randomInt } from "node:crypto";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getErrorMessage(err: unknown) {
    if (err instanceof Error) {
        return err.message;
    }
    return "Terjadi gangguan internal";
}

export function generateRandomCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 9; i++) {
        result += chars.charAt(randomInt(0, chars.length));
    }
    return result;
}
