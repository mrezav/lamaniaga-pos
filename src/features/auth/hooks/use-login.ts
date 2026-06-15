import { useMutation } from "@tanstack/react-query";
import { login } from "@/features/auth/actions";
import { LoginInput } from "../types/auth";
import { toast } from "sonner";

export function useLogin() {
    return useMutation({
        mutationFn: async (data: LoginInput) => {
            const result = await login(data);
            // Jika terjadi error interal sistem
            if (!result.success && result.error) {
                throw new Error(result.error);
            }
            // Jika sukses atau terkena error validasi
            return result;
        },
        onSuccess: (res) => {
            // Jika success dan tidak terjadi error validasi
            if (res.success) {
                toast.success("Login Berhasil");
            }
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
}
