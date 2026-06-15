import { useQuery } from "@tanstack/react-query";
import { getUserStoresActions } from "../actions/get-user-stores";

export const useStores = () => {
    const getUserStores = useQuery({
        queryKey: ["user-stores"],
        queryFn: async () => {
            const response = await getUserStoresActions();
            if (!response.success) {
                throw new Error(response.error);
            }
            return response.data;
        },
    });

    // const getStoreQuery = useQuery({
    //     queryKey: ["store", storeSlug],
    //     queryFn: async (slug: string) => {
    //         const response = await getStoreAction(slug);
    //         if (!response.success) {
    //             throw new Error(response.error);
    //         }
    //         return response;
    //     },
    // });

    return {
        // getStoreQuery,
        getUserStoresQuery: getUserStores,
    };
};
