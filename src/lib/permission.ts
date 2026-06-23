import { MemberRole, MemberStatus } from "@/db/schema";
import { PERMISSIONS, UserAction } from "@/types";
import { findStoreMember } from "@/features/store/repositories";
import { verifyAuth } from "./auth";

// Fungsi untuk melakukan check user login, verifikasi member dan hak akses
export async function checkPermission(
    storeId: string,
    resource: keyof typeof PERMISSIONS,
    action: UserAction,
) {
    const user = await verifyAuth();
    if (!user) {
        throw new Error("Silahkan login terlebih dahulu");
    }

    if (!storeId) {
        throw new Error("Store ID tidak valid atau kosong");
    }

    const verifiedMember = await findStoreMember(
        storeId,
        user.id,
        MemberStatus.ACTIVE,
    );
    if (!verifiedMember) {
        throw new Error("Anda belum terdaftar atau aktif di toko ini");
    }

    const isAllowed = hasPermission(verifiedMember.role, resource, action);
    if (!isAllowed) {
        throw new Error("Anda tidak memiliki akses untuk aksi ini");
    }

    return { userId: user.id, role: verifiedMember.role as MemberRole };
}

// Fungsi pembantu (helper) instan untuk mengecek izin akses tanpa error TypeScript
export function hasPermission(
    role: MemberRole,
    resource: keyof typeof PERMISSIONS,
    action: UserAction,
) {
    const allowedRoles = PERMISSIONS[resource][action] as readonly MemberRole[];
    return allowedRoles.includes(role);
}
