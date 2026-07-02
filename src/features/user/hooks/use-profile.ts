"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentProfileAction } from "../actions/get-current-profile";

export function useProfile() {
    return useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const response = await getCurrentProfileAction();
            if (!response.success) {
                throw new Error(response.error);
            }
            return response;
        },
    });
}
