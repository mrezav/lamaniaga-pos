import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    // Gunakan ENV domain yang pasti aman untuk live & lokal
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!code) {
        return NextResponse.redirect(`${baseUrl}/login?error=auth_code_error`);
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
        console.error("Auth callback error:", error);
        return NextResponse.redirect(`${baseUrl}/login?error=auth_code_error`);
    }

    // Ambil metadata sebelum masuk ke proses async database
    const fullName = data.user.user_metadata?.full_name ?? "User";
    const userId = data.user.id;

    try {
        // Bungkus dengan Promise agar runtime serverless benar-benar menunggu operasi database selesai
        await new Promise<void>(async (resolve, reject) => {
            try {
                await db
                    .insert(profiles)
                    .values({
                        id: userId,
                        fullName: fullName,
                    })
                    .onConflictDoNothing({ target: profiles.id });

                resolve();
            } catch (err) {
                reject(err);
            }
        });

        console.log("Profile successfully created for user:", userId);
    } catch (dbError) {
        // Jika memang DB error (misal skema tidak cocok/connection timeout), sekarang PASTI tercatat di Vercel Logs
        console.error("Profile insertion error in live:", dbError);
    }

    // Baris ini baru boleh dieksekusi SETELAH Promise database di atas resolve/reject selesai.
    return NextResponse.redirect(`${baseUrl}/stores`);
}
