import { create } from "zustand";

interface ProductUIState {
    isDeleting: boolean;
    currentDeletingId: string | null;
    setIsDeleting: (status: boolean, id: string | null) => void;
    numberList: (index: number, page?: number, limit?: number) => number;
}

export const useProductStore = create<ProductUIState>((set) => ({
    isDeleting: false,
    currentDeletingId: null,
    setIsDeleting: (status, id) =>
        set({ isDeleting: status, currentDeletingId: id }),
    numberList: (index, page = 1, limit = 10) => (page - 1) * limit + index + 1,
}));
