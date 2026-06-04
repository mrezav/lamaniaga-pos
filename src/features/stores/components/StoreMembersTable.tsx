"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getStoreMembersAction,
    updateMemberStatusAction,
} from "../services/join-actions";
import { useToastStore } from "@/state/useToastStore";
import { Button } from "@/components/ui/button";
import { Check, X, Users, Loader2, Award } from "lucide-react";

interface StoreMembersTableProps {
    storeId: string;
}

export function StoreMembersTable({ storeId }: StoreMembersTableProps) {
    const queryClient = useQueryClient();
    const { showToast } = useToastStore();

    // 1. Fetch store members with TanStack Query
    const { data, isLoading, error } = useQuery({
        queryKey: ["storeMembers", storeId],
        queryFn: async () => {
            const result = await getStoreMembersAction(storeId);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
    });

    // 2. TanStack Query Mutation to update membership status
    const mutation = useMutation({
        mutationFn: async ({
            memberId,
            status,
        }: {
            memberId: string;
            status: "active" | "rejected";
        }) => {
            const result = await updateMemberStatusAction(memberId, status);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result;
        },
        onSuccess: (_, variables) => {
            const actionName =
                variables.status === "active" ? "menyetujui" : "menolak";
            showToast(`Berhasil ${actionName} anggota baru!`, "success");
            // Invalidate query to refresh table data instantly
            queryClient.invalidateQueries({
                queryKey: ["storeMembers", storeId],
            });
        },
        onError: (err: Error) => {
            showToast(
                err.message || "Gagal memperbarui status keanggotaan.",
                "error",
            );
        },
    });

    if (isLoading) {
        return (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-md flex flex-col items-center justify-center min-h-75 space-y-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="text-slate-400 text-sm font-semibold">
                    Memuat daftar keanggotaan...
                </span>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-md flex flex-col items-center justify-center min-h-75 text-center space-y-4">
                <p className="text-red-500 font-bold">
                    Gagal memuat data anggota.
                </p>
                <span className="text-slate-400 text-xs">
                    {error?.message || ""}
                </span>
            </div>
        );
    }

    // Filter out 'owner' from the listed actions/table if desired, or show all
    // The owner role is marked by the stores table owner_id, let's keep all and show their role badges

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/40 overflow-hidden">
            {/* Table Header Section */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-slate-800 text-sm">
                            Daftar Keanggotaan & Pelamar
                        </h3>
                        <p className="text-slate-400 text-xs font-semibold">
                            Kelola siapa saja yang memiliki akses ke kasir Anda
                        </p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-500 text-xs font-bold rounded-lg font-mono">
                    Total: {data.length}
                </span>
            </div>

            {data.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                        <Users className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-slate-700 font-extrabold text-sm">
                            Belum Ada Anggota
                        </p>
                        <p className="text-slate-400 text-xs max-w-sm font-medium leading-relaxed">
                            Bagikan kode akses di samping agar staf kasir Anda
                            dapat melamar untuk bergabung dengan toko ini.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                <th className="py-4 px-6">Pengguna</th>
                                <th className="py-4 px-6">Role</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.map((member) => {
                                const isPending = member.status === "pending";
                                const isActive = member.status === "active";
                                const isRejected = member.status === "rejected";
                                const isMutationPending =
                                    mutation.isPending &&
                                    mutation.variables?.memberId === member.id;

                                return (
                                    <tr
                                        key={member.id}
                                        className="hover:bg-slate-50/30 transition-colors group"
                                    >
                                        {/* User Profile */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 border border-slate-200/50 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                                                    {member.avatarUrl ? (
                                                        <img
                                                            src={
                                                                member.avatarUrl
                                                            }
                                                            alt={
                                                                member.fullName
                                                            }
                                                            className="w-full h-full object-cover rounded-xl"
                                                        />
                                                    ) : (
                                                        member.fullName.charAt(
                                                            0,
                                                        )
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-extrabold text-slate-800 text-sm truncate">
                                                        {member.fullName}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                                                        {member.userId}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1.5">
                                                <Award
                                                    className={`w-3.5 h-3.5 ${member.role === "owner" ? "text-blue-500" : "text-slate-400"}`}
                                                />
                                                <span className="text-xs text-slate-600 font-semibold capitalize">
                                                    {member.role === "owner"
                                                        ? "Pemilik"
                                                        : member.role ===
                                                            "manager"
                                                          ? "Manajer"
                                                          : "Kasir"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status Badge */}
                                        <td className="py-4 px-6">
                                            {isPending && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100/50">
                                                    Pending
                                                </span>
                                            )}
                                            {isActive && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                                                    Active
                                                </span>
                                            )}
                                            {isRejected && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100/50">
                                                    Rejected
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions Panel */}
                                        <td className="py-4 px-6 text-right">
                                            {isPending ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        onClick={() =>
                                                            mutation.mutate({
                                                                memberId:
                                                                    member.id,
                                                                status: "active",
                                                            })
                                                        }
                                                        disabled={
                                                            isMutationPending
                                                        }
                                                        className="h-8 px-3 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none transition-all flex items-center gap-1 shadow-sm shadow-emerald-100/30"
                                                    >
                                                        {isMutationPending &&
                                                        mutation.variables
                                                            ?.status ===
                                                            "active" ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <Check className="w-3.5 h-3.5" />
                                                        )}
                                                        <span>Setuju</span>
                                                    </Button>

                                                    <Button
                                                        onClick={() =>
                                                            mutation.mutate({
                                                                memberId:
                                                                    member.id,
                                                                status: "rejected",
                                                            })
                                                        }
                                                        disabled={
                                                            isMutationPending
                                                        }
                                                        className="h-8 px-3 rounded-lg text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border-none transition-all flex items-center gap-1 shadow-sm shadow-red-100/30"
                                                    >
                                                        {isMutationPending &&
                                                        mutation.variables
                                                            ?.status ===
                                                            "rejected" ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <X className="w-3.5 h-3.5" />
                                                        )}
                                                        <span>Tolak</span>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 font-semibold italic">
                                                    Sudah Diproses
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
