"use client";

import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/features/cashier/store/useCartStore";
import { CartItem } from "../types";

interface CartItemRowProps {
    item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
    const { updateQuantity, removeFromCart } = useCartStore();
    // const itemName = `${item.name}  ${item.variant.attributes ? item.variant.attributes.size : ""} ${item.variant.attributes ? item.variant.attributes.color : ""}`;

    return (
        <div className="flex items-center justify-between py-3 group">
            <div className="flex-1 min-w-0 pr-2">
                <h5 className="font-medium text-sm truncate">{item.name}</h5>
                <span className="text-muted-foreground">
                    <span className="text-sm font-bold text-emerald-600">
                        Rp {item.price.toLocaleString("id-ID")}{" "}
                    </span>
                    <span className="text-xs">({item.sku})</span>
                </span>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-lg bg-muted/50 overflow-hidden">
                        {/* Tombol Minus */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none"
                            onClick={() => updateQuantity(item.id, "decrement")}
                            disabled={item.quantity <= 1} // Mencegah minus di bawah 1
                        >
                            <Minus className="h-3 w-3" />
                        </Button>

                        {/* Input Angka (Menggantikan <span>) */}
                        <input
                            type="number"
                            // Jika nilainya 0 atau kosong, biarkan kosong di layar agar bisa diketik ulang
                            value={item.quantity === 0 ? "" : item.quantity}
                            min={1}
                            max={item.stock}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === "") {
                                    updateQuantity(item.id, ""); // Masuk ke kondisi hapus teks
                                } else {
                                    const parsed = parseInt(val, 10);
                                    if (!isNaN(parsed)) {
                                        updateQuantity(item.id, parsed); // Masuk ke typeof action === "number"
                                    }
                                }
                            }}
                            onBlur={() => {
                                // Pengaman: Jika input ditinggal dalam keadaan kosong, paksa balik ke 1
                                if (!item.quantity || item.quantity < 1) {
                                    updateQuantity(item.id, 1);
                                }
                            }}
                            className="h-7 w-10 bg-transparent text-center text-sm font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />

                        {/* Tombol Plus */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none"
                            onClick={() => updateQuantity(item.id, "increment")}
                            disabled={item.quantity >= (item.stock || 999)} // Batasi sesuai stok
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromCart(item.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
