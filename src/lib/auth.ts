import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/**
 * Memvalidasi apakah user sudah login.
 * Jika valid, mengembalikan objek user dari Supabase.
 * Jika tidak valid, otomatis redirect ke /login atau melempar error tergantung konteks.
 */
export async function verifyAuth() {
    const supabase = await createClient();

    // Menggunakan getUser() sangat krusial karena aman dari manipulasi cookie pihak ketiga
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        // Skenario 1: Jika dipanggil di dalam Server Component (Page/Layout), langsung redirect
        // Skenario 2: Jika dipanggil di Server Action, Anda bisa menangkap error ini atau membiarkannya melempar ke client
        redirect("/login");
    }

    // Mengembalikan data user yang bisa diekstrak ID-nya (user.id)
    return user;
}
