export interface CheckoutRequest {
    cart: CartItem[];
    isInstallment: boolean;
    paymentMethod: string;
    subTotal: number;
    tax: number;
    grandTotal: number;
    cashAmount: number; // uang masuk saat checkout
}

// Definisi Tipe Data Produk dari Database/Katalog
export interface CartItem {
    id: string;
    productId: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    stock: number;
}
