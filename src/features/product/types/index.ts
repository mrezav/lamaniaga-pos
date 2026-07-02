export interface FindProductsParams {
    storeId: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: "name" | "createdAt";
    sortOrder?: "asc" | "desc";
}

export interface ProductVariantItem {
    id: string;
    sku: string;
    price: string; // Drizzle mengembalikan numeric/decimal postgres sebagai string
    stock: number;
    unit: string;
    attributes: Record<string, any> | null;
}

export interface ProductListItem {
    id: string;
    name: string;
    merk: string | null;
    imageUrl: string | null;
    slug: string;
    isActive: boolean | null;
    description: string | null;
    createdAt: string | null;
    categoryId: string | null;
    categoryName: string | null;
    variants: ProductVariantItem[];
}

// Interface Utama untuk membungkus hasil Promise.all
export interface FindProductsResponse {
    items: ProductListItem[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}
