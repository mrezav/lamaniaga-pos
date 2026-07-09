import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit2, Trash2, Image, Eye, MoreHorizontal } from "lucide-react";
import { ProductListItem } from "../types";
import { formatIDR } from "@/utils";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

interface Props {
    item: ProductListItem;
    handleDetail: (id: string) => void;
    handleEdit: (id: string) => void;
    handleDelete: (id: string) => void;
    isDeleting: boolean;
}

export function ProductCard({
    item,
    handleDetail,
    handleEdit,
    handleDelete,
    isDeleting,
}: Props) {
    const prices = item.variants.map((v) => Number(v.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const totalStock = item.variants.reduce((acc, v) => acc + v.stock, 0);

    return (
        <Card className="group overflow-hidden rounded-xl border bg-card text-card-foreground transition-all duration-300 hover:shadow-md flex flex-col h-full p-0">
            {/* 1. Image Container (Rasio diubah ke 3:4 agar tidak terlalu panjang) */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                {item.imageUrl ? (
                    <img
                        onClick={() => handleDetail(item.id)}
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full cursor-pointer object-cover scale-100 object-center transition-transform duration-500 group-hover:scale-102"
                        loading="lazy"
                    />
                ) : (
                    <Image
                        onClick={() => handleDetail(item.id)}
                        className="h-full w-full object-cover cursor-pointer scale-100 object-center transition-transform duration-500 group-hover:scale-102"
                    >
                        {" "}
                    </Image>
                )}

                {/* Badge Kategori & Merk */}
                <div className="absolute inset-x-2.5 top-2.5 flex items-center justify-between pointer-events-none">
                    <Badge className="bg-background/90 text-foreground backdrop-blur-sm border-none shadow-sm text-[10px] px-2 py-0">
                        {item.categoryName}
                    </Badge>
                    <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 font-semibold bg-black/40 text-white border-none backdrop-blur-sm"
                    >
                        {item.merk}
                    </Badge>
                </div>

                {/* Tombol Aksi (Edit & Hapus) - Pojok Kanan Bawah Gambar */}
                <div className="absolute right-2 bottom-2 opacity-50 group-hover:opacity-100 transition-opacity duration-200">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 rounded-full shadow bg-background/95 backdrop-blur-sm"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem
                                onClick={() => handleDetail(item.id)}
                                className="cursor-pointer"
                            >
                                <Eye className="mr-2 h-3.5 w-3.5" />
                                <span>Detail</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleEdit(item.id)}
                                className="cursor-pointer text-amber-500 focus:text-yellow-500 focus:bg-amber-400/15"
                            >
                                <Edit2 className="mr-2 h-3.5 w-3.5" />
                                <span>Edit</span>
                            </DropdownMenuItem>
                            <DeleteConfirmDialog
                                isDeleting={isDeleting}
                                onConfirm={() => handleDelete(item.id)}
                                triggerButton={
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                    >
                                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                                        <span>Hapus</span>
                                    </DropdownMenuItem>
                                }
                                title="Apakah anda yakin menghapus produk ini?"
                                description="Semua varian produk akan ikut terhapus"
                            />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* 2. Informasi Produk (Dibuat super padat) */}
            <CardContent className="p-3 flex flex-col justify-between flex-1 gap-3">
                <div className="space-y-1">
                    {/* Baris Atas: Nama Produk */}
                    <h3 className="font-semibold text-foreground text-sm leading-snug tracking-tight line-clamp-1">
                        {item.name}
                    </h3>

                    {/* Baris Tengah: Info Stok & Varian yang Sejajar dan Rapi */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
                        <div className="flex items-center gap-1">
                            {/* <Box className="h-3.5 w-3.5 text-muted-foreground/70" /> */}
                            <span>
                                Stok:{" "}
                                <strong
                                    className={
                                        totalStock > 10
                                            ? "text-emerald-600 dark:text-emerald-500"
                                            : "text-amber-600"
                                    }
                                >
                                    {totalStock}
                                </strong>
                            </span>
                        </div>
                        <div className="flex gap-1 max-w-[50%] overflow-hidden">
                            {item.variants.slice(0, 3).map((v) => (
                                <span
                                    key={v.id}
                                    className="text-[9px] font-medium px-1 bg-muted border rounded"
                                >
                                    {v.attributes && v.attributes.size}
                                </span>
                            ))}
                            {item.variants.length > 3 && (
                                <span className="text-[9px]">
                                    +{item.variants.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Baris Bawah: Harga */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[15px] text-muted-foreground tracking-wider font-medium">
                        Harga
                    </span>
                    <div className="font-bold text-emerald-600 text-sm">
                        {item.variants.length == 1 ? (
                            <div>{formatIDR(minPrice)}</div>
                        ) : (
                            <div>
                                {formatIDR(minPrice)} ~ {formatIDR(maxPrice)}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
