"use client";

import { create } from "zustand";
import { CartItem } from "../types";

interface CartState {
    cart: CartItem[];
    // Aksi-aksi (Actions)
    addToCart: (product: Omit<CartItem, "quantity">) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (
        id: string,
        action: "increment" | "decrement" | number | "",
    ) => void;
    clearCart: () => void;
    // Selector Otomatis (Helper)
    getTotals: () => { subTotal: number; tax: number; grandTotal: number };
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

                // 1. Izinkan nilai 0 atau string kosong sewaktu user menghapus angka di input
                if (action === "" || action === 0) {
                    return { ...item, quantity: 0 };
                }

                // 2. Validasi batas stok (hanya jalan jika angkanya valid)
                if (newQuantity > item.stock) newQuantity = item.stock;

                // 3. Batasi minimal 1 jika aksi biasa, bukan sedang mengetik kosong
                if (newQuantity < 1) newQuantity = 1;

                return { ...item, quantity: newQuantity };
            }),
        }));
    },
    // 4. Reset / Bersihkan Keranjang Belanja
    clearCart: () => set({ cart: [] }),

    // 5. Kalkulator Total Instan
    getTotals: () => {
        const cart = get().cart;
        const subTotal = cart.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0,
        );
        // TODO: TERAPKAN SISTEM PAJAK AGAR KASIR DAPAT MEMILIH PAJAK YANG AKAN DIGUNAKAN SAAT CHECKOUT
        const tax = subTotal * 0; // PPN 11% = 0.11
        const grandTotal = subTotal + tax;

        return { subTotal, tax, grandTotal };
    },
}));
