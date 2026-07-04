import { useQuery } from "@tanstack/react-query";
import { FindTransactionsFilters } from "../types";
import { getTransactionsAction } from "../actions/get-transactions";

export function useTransactions(filters: FindTransactionsFilters) {
    const {
        storeId,
        search,
        page,
        limit,
        sortBy,
        sortOrder,
        paymentStatus,
        startDate,
        endDate,
    } = filters;
    return useQuery({
        queryKey: [
            "Transactions",
            storeId,
            { search, page, limit, sortBy, sortOrder, paymentStatus },
        ],
        queryFn: async () => {
            console.log(">>>", filters);
            const response = await getTransactionsAction(filters);
            if (!response.success) {
                throw new Error(response.error);
            }
            return response.data;
        },
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 30,
    });
}
