export interface getCategoriesParams {
    storeId: string;
    storeSlug: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: "name" | "createdAt";
    sortOrder?: "asc" | "desc";
}
