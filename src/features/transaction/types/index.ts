import { PaymentStatus } from "@/db/schema";

export interface FindTransactionsFilters {
    storeId: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "totalAmount";
    sortOrder?: "asc" | "desc";
    paymentStatus: PaymentStatus | "all";
    startDate?: string;
    endDate?: string;
}

export interface TransactionList {
    id: string;
    storeId: string;
    userId: string;
    invoiceNumber: string;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    isInstallment: boolean;
    cashierName: string;
    createdAt: string | null;
    items: TransactionItem[];
}

export interface TransactionItem {
    id: string;
    transactionId: string;
    productId: string;
    variantId: string;
    productName: string;
    productMerk: string | null;
    variantSku: string | null;
    price: number;
    quantity: number;
    subtotal: number;
}
// Interface Utama untuk membungkus hasil Promise.all
export interface FindTransactionsResponse {
    items: TransactionList[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}
