import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { profiles } from "@/db/schema"

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const next = searchParams.get("next") ?? "/dashboard"

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error && data.user) {
            // Insert into profiles table
            try {
                const fullName = data.user.user_metadata.full_name || "User"
                
                // Menggunakan Drizzle untuk insert ke tabel profiles
                await db.insert(profiles).values({
                    id: data.user.id,
                    fullName: fullName,
                    status: "idle",
                }).onConflictDoNothing(); // Mencegah error jika profil sudah ada
                
                return NextResponse.redirect(`${origin}${next}`)
            } catch (dbError) {
                console.error("Profile insertion error:", dbError)
                // Jika gagal insert profile, tetap redirect ke dashboard 
                // Aplikasi mungkin perlu menangani profile yang hilang nanti
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // Kembalikan user ke halaman error jika terjadi masalah
    return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
}
