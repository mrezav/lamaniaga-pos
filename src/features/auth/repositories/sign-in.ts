import { createClient } from "@/lib/supabase/server";

export async function signIn(email: string, password: string) {
    const supabase = await createClient();
    return supabase.auth.signInWithPassword({ email, password });
}
