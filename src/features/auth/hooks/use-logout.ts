import { useMutation } from "@tanstack/react-query";
import { logoutAction } from "../actions/logout";
import { toast } from "sonner";

export function useLogout() {
    return useMutation({
        mutationFn: async () => {
            const response = await logoutAction();
            if (!response.success) {
                throw new Error(response.error);
            }
            return response;
        },
        onSuccess: () => {
            toast.success("Logout berhasil");
        },
        onError: () => {
            toast.error("Logout gagal");
        },
    });
}
