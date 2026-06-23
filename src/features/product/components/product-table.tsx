"use client";

import { useState } from "react";
import Link from "next/link";
import { useProducts } from "@/features/product/hooks/use-products";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Plus, Edit2, Trash2 } from "lucide-react";
import { redirect } from "next/navigation";
import { useProductMutations } from "../hooks/use-product-mutations";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { getErrorMessage } from "@/lib/utils";

interface ProductTableProps {
    storeSlug: string;
}

export function ProductTable({ storeSlug }: ProductTableProps) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sort, setSort] = useState("createdAt-desc");
    const debouncedSearch = useDebounce(search, 400);
    const [sortBy, sortOrder] = sort.split("-") as [
        "name" | "createdAt",
        "asc" | "desc",
    ];

    const { data, isLoading } = useProducts({
        storeSlug,
        search: debouncedSearch,
        page,
        limit: 10,
        sortBy,
        sortOrder,
    });

    const items = data?.items ?? [];
    const pagination = data?.pagination ?? {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1,
    };

    function numberList(index: number) {
        return limit * (page - 1) + (index + 1);
    }

    function handleEdit(id: string) {
        redirect(`/stores/${storeSlug}/products/${id}/edit`);
    }

    const { deleteProduct, isDeleting } = useProductMutations(storeSlug);

    async function handleDelete(id: string) {
        try {
            await deleteProduct(id);
        } catch (err) {
            console.log("Error delete : ", getErrorMessage(err));
        }
    }

    function handleDetail(id: string) {
        console.log(id);
    }

    return (
        <div className="space-y-4 w-full">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Cari nama produk..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="pl-10 h-11 rounded-xl border-slate-200 focus-visible:ring-slate-400 bg-slate-50/30 w-full"
                    />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Select
                        value={sort}
                        onValueChange={(value) => {
                            setSort(value);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-48 h-11 rounded-xl border-slate-200 focus-visible:ring-slate-400 bg-slate-50/30">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="createdAt-desc">
                                Terbaru
                            </SelectItem>
                            <SelectItem value="createdAt-asc">
                                Terlama
                            </SelectItem>
                            <SelectItem value="name-asc">Nama A-Z</SelectItem>
                            <SelectItem value="name-desc">Nama Z-A</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        asChild
                        className="rounded-xl h-11 px-5 bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-medium"
                    >
                        <Link href={`/stores/${storeSlug}/products/create`}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Produk
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="border rounded-md bg-card min-h-50 flex flex-col justify-between">
                {isLoading ? (
                    <div className="flex flex-1 items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Merk</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Dibuat</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-8 text-muted-foreground"
                                    >
                                        Tidak ada produk ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((product, index) => (
                                    <TableRow
                                        key={product.id}
                                        onClick={() => handleDetail(product.id)}
                                    >
                                        <TableCell>
                                            {numberList(index)}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {product.name}
                                        </TableCell>
                                        <TableCell>{product.merk}</TableCell>
                                        <TableCell>
                                            {product.categoryName}
                                        </TableCell>
                                        <TableCell>
                                            {product.isActive
                                                ? "Aktif"
                                                : "Nonaktif"}
                                        </TableCell>
                                        <TableCell>
                                            {product.createdAt &&
                                                new Date(
                                                    product.createdAt,
                                                ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                className="rounded-lg bg-amber-400 hover:bg-amber-500 hover:cursor-pointer text-white"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleEdit(product.id)
                                                }
                                            >
                                                <Edit2 className="h-4 w-4 mr-2" />
                                                Ubah
                                            </Button>
                                            <DeleteConfirmDialog
                                                isDeleting={isDeleting}
                                                onConfirm={() =>
                                                    handleDelete(product.id)
                                                }
                                                triggerButton={
                                                    <Button
                                                        className="rounded-lg bg-pink-600 hover:bg-pink-700 hover:cursor-pointer text-white"
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Hapus
                                                    </Button>
                                                }
                                                title="Apakah anda yakin menghapus produk ini?"
                                                description="Semua varian produk akan ikut terhapus"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}

                <div className="flex items-center justify-between p-4 border-t bg-muted/20">
                    <span className="text-xs text-muted-foreground">
                        Total: {pagination.totalItems} produk
                    </span>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1 || isLoading}
                        >
                            Sebelumnya
                        </Button>
                        <span className="text-xs font-medium">
                            Hal {pagination.page} / {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setPage((p) =>
                                    Math.min(pagination.totalPages, p + 1),
                                )
                            }
                            disabled={
                                page >= pagination.totalPages || isLoading
                            }
                        >
                            Berikutnya
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
