"use client";

import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore, CartItem } from "@/features/cashier/store/useCartStore";

interface CartItemRowProps {
    item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
    const { updateQuantity, removeFromCart } = useCartStore();
    const itemName = `${item.name}  ${item.variant.attributes ? item.variant.attributes.size : ""} ${item.variant.attributes ? item.variant.attributes.color : ""}`;

    return (
        <div className="flex items-center justify-between py-3 group">
            <div className="flex-1 min-w-0 pr-2">
                <h5 className="font-medium text-sm truncate">{itemName}</h5>
                <span className="text-xs text-muted-foreground">
                    Rp {item.price.toLocaleString("id-ID")} ({item.variant.sku})
                </span>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center border rounded-lg bg-muted/50">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-r-none"
                        onClick={() => updateQuantity(item.id, "decrement")}
                    >
                        <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-semibold px-1 w-7 text-center">
                        {item.quantity}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-l-none"
                        onClick={() => updateQuantity(item.id, "increment")}
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
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
