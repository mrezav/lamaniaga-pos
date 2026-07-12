import { create } from "zustand";

interface ProductFilterState {
    search: string;
    categoryId: string | null;
    sortBy: "name" | "createdAt";
    sortOrder: "asc" | "desc";
    setSearch: (search: string) => void;
    setCategoryId: (categoryId: string | null) => void;
    setSorting: (
        sortBy: "name" | "createdAt",
        sortOrder: "asc" | "desc",
    ) => void;
    resetFilters: () => void;
}

export const useProductFilterStore = create<ProductFilterState>((set) => ({
    search: "",
    categoryId: null,
    sortBy: "name",
    sortOrder: "asc",
    setSearch: (search) => set({ search }),
    setCategoryId: (categoryId) => set({ categoryId }),
    setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
    resetFilters: () =>
        set({ search: "", categoryId: null, sortBy: "name", sortOrder: "asc" }),
}));
