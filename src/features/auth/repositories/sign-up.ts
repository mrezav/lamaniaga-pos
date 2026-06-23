import { createClient } from "@/lib/supabase/server";
import { signUpParams } from "../types/auth";

export async function signUp({
    fullName,
    email,
    password,
    redirectTo,
}: signUpParams) {
    const supabase = await createClient();
    return supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo, data: { full_name: fullName } },
    });
}
