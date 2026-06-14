import { useMutation, useQueryClient } from "@tanstack/react-query";
import { JoinStoreInput } from "../schemas/join-schema";
import { toast } from "sonner";
import { updateMemberStatusAction } from "../actions/update-member";
import { submitJoinCodeAction } from "../actions/submit-join";
import { MemberStatus } from "@/db/schema";

export const useStoreMutation = () => {
    const queryClient = useQueryClient();

    const joinStore = useMutation({
        mutationFn: async (data: JoinStoreInput) => {
            const result = await submitJoinCodeAction(data);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result;
        },
        onSuccess: () => {
            toast.success(
                "Permintaan terkirim! Silakan hubungi pemilik toko untuk menyetujui pendaftaran Anda.",
            );
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const updateMemberStatus = useMutation({
        mutationFn: async ({
            storeId,
            memberId,
            status,
        }: {
            storeId: string;
            memberId: string;
            status: MemberStatus;
        }) => {
            const result = await updateMemberStatusAction(
                storeId,
                memberId,
                status,
            );
            if (!result.success) {
                throw new Error(result.error);
            }
            return result;
        },
        onSuccess: (_, variables) => {
            const actionName =
                variables.status === "active" ? "menyetujui" : "menolak";
            toast.success(`Berhasil ${actionName} anggota`);
            queryClient.invalidateQueries({
                queryKey: ["storeMembers", variables.storeId],
            });
        },
        onError: (error: Error) => {
            toast.error(error.message ?? "Gagal memperbarui anggota");
        },
    });
    return {
        joinStoreMutate: joinStore.mutateAsync,
        isJoining: joinStore.isPending,
        updateMemberStatusMutate: updateMemberStatus.mutateAsync,
        isUpdatingMemberStatus: updateMemberStatus.isPending,
        updateMemberVariables: updateMemberStatus.variables,
    };
};
