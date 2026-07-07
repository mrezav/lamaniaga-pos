import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit2, Trash2, Box, SearchAlert } from "lucide-react";
import { ProductListItem } from "../types";
import { ProductCard } from "./ProductCard";

// Contoh data array dari JSON yang Anda miliki
const productsData = [
    {
        id: "4c63a58a-0431-4ee6-afa5-5aa2e11c3301",
        name: "Jaket Bomber",
        merk: "Eiger",
        imageUrl:
            "http://127.0.0.1:54321/storage/v1/object/public/public-assets/amanah/products/products-1783334458852.jpg",
        slug: "jaket-bomber",
        isActive: true,
        description: null,
        categoryName: "Pakaian",
        variants: [
            {
                id: "11d9a7b7...",
                sku: "KSKS",
                price: 250000,
                stock: 31,
                attributes: { size: "L", color: "Gading" },
                unit: "pcs",
            },
            {
                id: "ce858498...",
                sku: "LJKKS",
                price: 210000,
                stock: 22,
                attributes: { size: "M", color: "Hitam" },
                unit: "pcs",
            },
        ],
    },
    // Data produk lain...
];

interface Props {
    items: ProductListItem[];
    handleEdit: (id: string) => void;
    handleDelete: (id: string) => void;
    isDeleting: boolean;
}
export default function ProductGrid({
    items,
    handleEdit,
    handleDelete,
    isDeleting,
}: Props) {
    if (items.length < 1) {
        return (
            <div className="grid justify-items-center items-center text-center gap-2">
                <SearchAlert />
                <p>Produk tidak ditemukan</p>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-6">
            {items.map((item) => (
                <ProductCard
                    key={item.id}
                    item={item}
                    handleDelete={handleDelete}
                    handleEdit={handleEdit}
                    isDeleting={isDeleting}
                ></ProductCard>
            ))}
        </div>
    );
}
