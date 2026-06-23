import { useMutation } from "@tanstack/react-query";
import { register } from "../actions/register";
import { RegisterInput } from "../types";
import { toast } from "sonner";

export function useRegister() {
    return useMutation({
        mutationFn: async (input: RegisterInput) => {
            const result = await register(input);
            if (!result.success && result.error) {
                throw new Error(result.error);
            }

            return result;
        },
        onSuccess: (res) => {
            // Jika success dan tidak terjadi error validasi
            if (res.success) {
                toast.success("Registrasi berhasil");
            }
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
}
