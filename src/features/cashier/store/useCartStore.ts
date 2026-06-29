import { ProductVariantItem } from "@/features/product/types";
import { create } from "zustand";

// Definisi Tipe Data Produk dari Database/Katalog
export interface CartItem {
    id: string;
    name: string;
    price: number;
    variant: ProductVariantItem;
    quantity: number;
    stock: number;
}

interface CartState {
    cart: CartItem[];
    // Aksi-aksi (Actions)
    addToCart: (product: Omit<CartItem, "quantity">) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (
        id: string,
        action: "increment" | "decrement" | number,
    ) => void;
    clearCart: () => void;
    // Selector Otomatis (Helper)
    getTotals: () => { subtotal: number; tax: number; grandTotal: number };
}

export const useCartStore = create<CartState>((set, get) => ({
    cart: [],

    // 1. Tambah Produk ke Keranjang
    addToCart: (product) => {
        set((state) => {
            const existingItem = state.cart.find(
                (item) => item.id === product.id,
            );

            if (existingItem) {
                // Jika stok tidak mencukupi saat ditambah
                if (existingItem.quantity >= product.stock) return state;

                return {
                    cart: state.cart.map((item) =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item,
                    ),
                };
            }

            // Jika item baru pertama kali dimasukkan
            return { cart: [...state.cart, { ...product, quantity: 1 }] };
        });
    },

    // 2. Hapus Item dari Keranjang
    removeFromCart: (id) => {
        set((state) => ({
            cart: state.cart.filter((item) => item.id !== id),
        }));
    },

    // 3. Update Jumlah Barang (Bisa +1, -1, atau input angka langsung)
    updateQuantity: (id, action) => {
        set((state) => ({
            cart: state.cart.map((item) => {
                if (item.id !== id) return item;

                let newQuantity = item.quantity;
                if (action === "increment") newQuantity += 1;
                if (action === "decrement") newQuantity -= 1;
                if (typeof action === "number") newQuantity = action;

                // Validasi batas stok dan minimal 1 barang
                if (newQuantity > item.stock) newQuantity = item.stock;
                if (newQuantity < 1) newQuantity = 1;

                return { ...item, quantity: newQuantity };
            }),
            // Opsional: jika ingin otomatis hapus saat quantity menjadi 0, pasang logic di sini
        }));
    },

    // 4. Reset / Bersihkan Keranjang Belanja
    clearCart: () => set({ cart: [] }),

    // 5. Kalkulator Total Instan
    getTotals: () => {
        const cart = get().cart;
        const subtotal = cart.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0,
        );
        const tax = subtotal * 0.11; // PPN 11%
        const grandTotal = subtotal + tax;

        return { subtotal, tax, grandTotal };
    },
}));
