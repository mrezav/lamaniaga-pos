"use client";

import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import { useCartStore } from "@/features/cashier/store/useCartStore";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductListItem, ProductVariantItem } from "@/features/product/types";
import { formatIDR } from "@/utils";

interface ProductCardProps {
    product: ProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
    const addToCart = useCartStore((state) => state.addToCart);

    // Ambil varian termurah untuk ditampilkan sebagai harga "Mulai dari"
    const prices = product.variants.map((v) => Number(v.price));
    const minPrice = Math.min(...prices);
    const hasMultipleVariants = product.variants.length > 1;

    const handleAddVariantToCart = (variant: ProductVariantItem) => {
        const attributeParts = [
            product.merk,
            variant.attributes?.size,
            variant.attributes?.color,
        ].filter(Boolean);
        const itemName = `${product.name} (${attributeParts.join(" ")})`;
        // Masukkan ke Zustand dengan menggabungkan nama produk + SKU sebagai penanda di Cart
        addToCart({
            id: variant.id, // ID Unik di Cart menggunakan ID Variant, bukan ID Produk parent
            productId: product.id,
            name: itemName,
            sku: variant.sku,
            price: Number(variant.price),
            stock: variant.stock,
        });
    };

    return (
        <div className="group bg-card rounded-xl border p-2 flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all">
            <div>
                <div className="aspect-square w-full rounded-lg bg-muted mb-2 flex flex-col items-center justify-center text-muted-foreground p-0.5 text-center">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt="Product Cart"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/60">
                                {product.merk}
                            </span>
                            <span className="text-xs font-medium mt-1 truncate w-full">
                                {product.categoryName}
                            </span>
                        </>
                    )}
                </div>
                <h4 className="font-semibold text-sm mx-2 line-clamp-2 leading-tight">
                    {product.name}{" "}
                    <span className="text-xs text-muted-foreground">
                        ({product.merk})
                    </span>
                </h4>
            </div>

            <div className="my-3 mx-2 flex items-center justify-between gap-1">
                <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground leading-none">
                        {hasMultipleVariants ? "Mulai dari" : "Harga"}
                    </span>
                    <span className="text-base font-semibold text-foreground tabular-nums">
                        {formatIDR(minPrice)}
                    </span>
                </div>

                {/* LOGIKA TOMBOL DINAMIS */}
                {hasMultipleVariants ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1 rounded-lg border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white"
                            >
                                <span>Opsi</span>
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-56 rounded-xl"
                        >
                            {product.variants.map((variant) => (
                                <DropdownMenuItem
                                    key={variant.id}
                                    disabled={variant.stock === 0}
                                    className="flex justify-between items-center text-xs py-2 cursor-pointer"
                                    onClick={() =>
                                        handleAddVariantToCart(variant)
                                    }
                                >
                                    <div className="flex flex-col">
                                        <span className="font-semibold">
                                            {variant.sku}{" "}
                                            {variant.attributes &&
                                            variant.attributes.size
                                                ? variant.attributes.size
                                                : ""}{" "}
                                            {variant.attributes &&
                                            variant.attributes.color
                                                ? variant.attributes.color
                                                : ""}
                                        </span>
                                        <span className="text-[10px]">
                                            Stok:{" "}
                                            <strong
                                                className={
                                                    variant.stock > 10
                                                        ? "text-emerald-600 dark:text-emerald-500"
                                                        : "text-amber-600"
                                                }
                                            >
                                                {variant.stock} {variant.unit}
                                            </strong>
                                        </span>
                                    </div>
                                    <span className="font-bold text-primary">
                                        {formatIDR(Number(variant.price))}
                                    </span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div>
                        <span className="mx-2 text-xs text-muted text-slate-600">
                            Stok:{" "}
                            <strong
                                className={
                                    product.variants[0].stock > 10
                                        ? "text-emerald-600 dark:text-emerald-500"
                                        : "text-amber-600"
                                }
                            >
                                {product.variants[0].stock}{" "}
                                {product.variants[0].unit}
                            </strong>
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 rounded-full bg-primary/5 hover:bg-primary text-primary hover:text-white border-primary/20"
                            disabled={product.variants[0]?.stock === 0}
                            onClick={() =>
                                handleAddVariantToCart(product.variants[0])
                            }
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
