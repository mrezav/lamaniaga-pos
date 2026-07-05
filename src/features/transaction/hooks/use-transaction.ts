import { useQuery } from "@tanstack/react-query";
import { getTransactionAction } from "../actions/get-transaction";

export function useTransaction(id: string, storeSlug: string) {
    return useQuery({
        queryKey: ["transaction", id],
        queryFn: async () => {
            const response = await getTransactionAction(id, storeSlug);
            if (!response.success) {
                throw new Error();
            }
            console.log();
            return response.data;
        },
    });
}
