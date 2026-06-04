import { createClient } from "./supabase/server";
import { getVerifiedMember } from "@/features/auth/repositories";
import { hasPermission, Role } from "@/features/auth/types/permission";

export async function guard(
    storeId: string,
    resource: "category",
    action: "create" | "edit" | "view" | "delete",
) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Silahkan login terlebih dahulu");
    }

    if (!storeId) {
        throw new Error("Store ID tidak valid atau kosong");
    }

    const verifiedMember = await getVerifiedMember(storeId, user.id);
    if (!verifiedMember) {
        throw new Error("Anda belum terdaftar atau aktif di toko ini");
    }

    const isAllowed = hasPermission(verifiedMember.role, resource, action);
    if (!isAllowed) {
        throw new Error("Anda tidak memiliki akses untuk aksi ini");
    }

    return { userId: user.id, role: verifiedMember.role as Role };
}
