import { useMutation } from "@tanstack/react-query";
import { login } from "@/features/auth/actions";
import { LoginInput } from "../types/auth";
import { toast } from "sonner";

export function useLogin() {
    return useMutation({
        mutationFn: ({ email, password }: LoginInput) =>
            login({ email, password }),
        onSuccess: () => {
            toast.success("Selamat datang");
        },
        onError: () => {
            toast.error("Login error");
        },
    });
}
