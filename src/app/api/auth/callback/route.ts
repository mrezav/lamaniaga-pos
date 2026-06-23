import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    // Hanya terima query ?code= dari Supabase setelah klik link verifikasi
    if (!code) {
        return NextResponse.redirect(`${origin}/login?error=auth_code_error`);
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    // Gagal tukar code → tidak ada session → arahkan ke login
    if (error || !data.user) {
        console.error("Auth callback error:", error);
        return NextResponse.redirect(`${origin}/login?error=auth_code_error`);
    }

    // Session sudah tersimpan (cookie di-set oleh Supabase SSR client)
    try {
        const fullName = data.user.user_metadata?.full_name ?? "User";
        await db
            .insert(profiles)
            .values({
                id: data.user.id,
                fullName,
            })
            .onConflictDoNothing({ target: profiles.id });
    } catch (dbError) {
        // Profil gagal dibuat, tetap lanjut ke /stores — user bisa onboarding ulang
        console.error("Profile insertion error:", dbError);
    }

    return NextResponse.redirect(`${origin}/stores`);
}
