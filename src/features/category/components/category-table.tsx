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
import { Loader2, ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";
import Link from "next/link";
export function CategoryTable({ storeSlug }: { storeSlug: string }) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState("createdAt-desc");

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
        sortBy,
        sortOrder,
    });

    // Ekstrak data dengan fallback nilai default yang aman agar TIDAK EROR saat ganti halaman
    const items = data?.items ?? [];
    const pagination = data?.pagination ?? {
        page: 1,
        totalPages: 1,
        totalItems: 0,
    };

    return (
        <div className="space-y-4 w-full">
            {/* <div className="p-4 bg-zinc-950 text-emerald-400 font-mono text-xs rounded border mb-4">
                <p className="font-bold border-b border-zinc-800 pb-1 mb-2 text-zinc-400">
                    🐞 DEBUG HOOK RETURN:
                </p>
                {isLoading
                    ? "Loading data dari hook..."
                    : JSON.stringify(data, null, 2)}
            </div> */}
            {/* FILTER & SORT PANEL */}
            {/* PANEL KONTROL: SEARCH & FILTER ONLY */}
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
                                <TableHead>Nama Kategori</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Deskripsi</TableHead>
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
                                items.map((cat) => (
                                    <TableRow key={cat.id}>
                                        <TableCell className="font-medium">
                                            {cat.name}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {cat.slug}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {cat.description || "-"}
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
