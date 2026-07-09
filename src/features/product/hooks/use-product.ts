import { useQuery } from "@tanstack/react-query";
import getProductByIdAction from "../actions/get-product";
import { UserAction } from "@/types";

export function useProduct(productId: string, storeSlug: string) {
    return useQuery({
        queryKey: ["product", storeSlug, productId],
        queryFn: async () => {
            const response = await getProductByIdAction(
                productId,
                storeSlug,
                UserAction.VIEW,
            );

            if (!response.success) throw new Error(response.error);
            return response.data;
        },
        enabled: !!productId && !!storeSlug,
    });
}
