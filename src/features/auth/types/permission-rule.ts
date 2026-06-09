// 1. Definisikan tipe Role sesuai skema database Anda
export type Role = "owner" | "manager" | "cashier";

// 2. Definisikan matriks aksi yang diizinkan untuk setiap resource
export const PERMISSIONS = {
    category: {
        create: ["owner", "manager"],
        edit: ["owner", "manager"],
        delete: ["owner"],
        view: ["owner", "manager", "cashier"],
    },
    // Anda bisa menambahkan resource lain (seperti 'product' atau 'supplier') di sini nanti
} as const;

// 3. Fungsi pembantu (helper) instan untuk mengecek izin akses
// Fungsi pembantu (helper) instan untuk mengecek izin akses tanpa error TypeScript
export function hasPermission(
    role: Role,
    resource: keyof typeof PERMISSIONS,
    action: "create" | "edit" | "delete" | "view",
) {
    const allowedRoles = PERMISSIONS[resource][action] as readonly Role[];
    return allowedRoles.includes(role);
}
