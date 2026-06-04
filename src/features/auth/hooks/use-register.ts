import { useMutation } from "@tanstack/react-query";
import { register } from "../actions/register";

export function useRegister() {
    return useMutation({
        mutationFn: register,
    });
}
