import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { full_name, email, password } = body;

        // Validasi input
        if (!full_name || !email || !password) {
            return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
        }

        // Password minimal 8 karakter, terdiri dari huruf dan angka
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return NextResponse.json({ 
                error: "password minimal 8 karakter, terdiri dari huruf dan angka" 
            }, { status: 400 });
        }

        const supabase = await createClient();
        const origin = new URL(request.url).origin;

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${origin}/auth/callback`,
                data: {
                    full_name
                }
            }
        });

        if (error) {
            // Supabase returns specific error for existing users if configured, 
            // but often it's generic for security. 
            // We'll handle the "already registered" case if possible.
            if (error.message.toLowerCase().includes("already registered")) {
                return NextResponse.json({ error: "email sudah terdaftar" }, { status: 400 });
            }
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ data: "OK" });
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
    }
}
