"use client";

import { useState } from "react";
import { useCategories } from "../hooks/use-categories";
import { useDebounce } from "@/hooks/use-debounce";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2,
    ChevronLeft,
    ChevronRight,
    Search,
    Edit2,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCategoryMutations } from "../hooks/use-category-mutation";
import { redirect } from "next/navigation";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { getErrorMessage } from "@/lib/utils";

export function CategoryTable({ storeSlug }: { storeSlug: string }) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [sort, setSort] = useState("createdAt-desc");
    const { deleteCategory, isDeleting } = useCategoryMutations(storeSlug);

    async function handleDelete(id: string) {
        try {
            await deleteCategory(id);
        } catch (err) {
            console.error("Error delete category :", getErrorMessage(err));
        }
    }

    async function handleEdit(id: string) {
        // await checkPermission("1", "membership", "edit");
        redirect(`/stores/${storeSlug}/categories/${id}/edit`);
    }

    // Debounce pencarian agar tidak membebani database
    const debouncedSearch = useDebounce(search, 400);
    const [sortBy, sortOrder] = sort.split("-") as [
        "name" | "createdAt",
        "asc" | "desc",
    ];

    // Ambil data menggunakan Hook React Query
    const { data, isLoading } = useCategories({
        storeSlug,
        search: debouncedSearch,
        page,
        limit,
        sortBy,
        sortOrder,
    }).getCategoriesQuery;

    // Ekstrak data dengan fallback nilai default yang aman agar TIDAK EROR saat ganti halaman
    const items = data?.items ?? [];
    const pagination = data?.pagination ?? {
        page: 1,
        totalPages: 1,
        totalItems: 0,
    };

    function numberList(index: number) {
        return limit * (page - 1) + (index + 1);
    }

    return (
        <div className="space-y-4 w-full">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center w-full">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Cari nama kategori..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="pl-10 h-11 rounded-xl border-slate-200 focus-visible:ring-slate-400 bg-slate-50/30 w-full"
                    />
                </div>

                <div className="w-full sm:w-auto flex justify-end">
                    <Select
                        value={sort}
                        onValueChange={(v) => {
                            setSort(v);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-44 h-11 rounded-xl border-slate-200 focus-visible:ring-slate-400 bg-slate-50/30">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="createdAt-desc">
                                Urutkan: Terbaru
                            </SelectItem>
                            <SelectItem value="name-asc">
                                Urutkan: Nama (A-Z)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* DATA TABLE */}
            <div className="border rounded-md bg-card min-h-[200px] flex flex-col justify-between">
                {isLoading ? (
                    <div className="flex flex-1 items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No</TableHead>
                                <TableHead>Nama Kategori</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="text-center py-8 text-muted-foreground"
                                    >
                                        Tidak ada kategori ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((cat, index) => (
                                    <TableRow key={cat.id}>
                                        <TableCell>
                                            {numberList(index)}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {cat.name}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {cat.slug}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {cat.description || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                onClick={() =>
                                                    handleEdit(cat.id)
                                                }
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-lg bg-amber-400 hover:bg-amber-500 hover:cursor-pointer text-white"
                                            >
                                                {/* <Link
                                                    href={`/stores/${storeSlug}/categories/${cat.id}/edit`}
                                                > */}
                                                <Edit2 className="h-4 w-4 mr-2" />
                                                Ubah
                                                {/* </Link> */}
                                            </Button>
                                            <DeleteConfirmDialog
                                                onConfirm={() =>
                                                    handleDelete(cat.id)
                                                }
                                                isDeleting={isDeleting}
                                                title="Apakah anda yakin menghapus kategori"
                                                description="Semua produk di dalamnya menjadi tanpa kategori"
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
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}

                {/* PAGINATION CONTROLS */}
                <div className="flex items-center justify-between p-4 border-t bg-muted/20">
                    <span className="text-xs text-muted-foreground">
                        Total: {pagination.totalItems} data
                    </span>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p - 1)}
                            disabled={page <= 1 || isLoading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs font-medium">
                            Hal {pagination.page} / {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={
                                page >= pagination.totalPages || isLoading
                            }
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
