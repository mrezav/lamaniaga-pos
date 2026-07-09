"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useProducts } from "@/features/product/hooks/use-products";
import { useDebounce } from "@/hooks/use-debounce";
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
    Search,
    Plus,
    Edit2,
    Trash2,
    LayoutGrid,
    List,
    ArrowDownWideNarrowIcon,
    SlidersHorizontal,
    Palette,
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { redirect } from "next/navigation";
import { useProductMutations } from "../hooks/use-product-mutations";
import { ToastTrigger } from "@/components/shared/ToastTrigger";
import { getErrorMessage } from "@/utils";
import ProductGrid from "./ProductGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductTable from "./ProductTable";
import PaginationSection from "@/components/shared/PaginationSection";
import { useCategoryList } from "@/features/category/hooks/use-categories";
import LoadingSection from "@/components/shared/LoadingSection";

interface ProductTableProps {
    storeSlug: string;
}

export function ProductList({ storeSlug }: ProductTableProps) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sort, setSort] = useState("createdAt-desc");
    const debouncedSearch = useDebounce(search, 400);
    const [sortBy, sortOrder] = sort.split("-") as [
        "name" | "createdAt",
        "asc" | "desc",
    ];
    const [categoryId, setCategoryId] = useState("all");

    const { data: categoryList } = useCategoryList(storeSlug);
    const categories = [
        { id: "all", name: "Semua Kategori" }, // Object mock untuk me-reset filter
        ...(categoryList ?? []),
    ];

    const { data, isLoading } = useProducts({
        storeSlug,
        search: debouncedSearch,
        categoryId,
        page,
        limit: 8,
        sortBy,
        sortOrder,
    });

    const items = data?.items ?? [];
    const pagination = data?.pagination ?? {
        page: 1,
        limit: 8,
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
        redirect(`/stores/${storeSlug}/products/${id}`);
    }

    return (
        <main>
            <Suspense fallback={null}>
                <ToastTrigger />
            </Suspense>
            <div className="space-y-4 w-full">
                <Tabs defaultValue="grid" className="w-full">
                    <div className="flex items-center justify-between pb-6 md:gap-2">
                        <div className="flex items-center gap-2 w-full sm:justify-between">
                            {/* 🔍 SEARCH BAR (Muncul di Mobile & Desktop) */}
                            <div className="relative flex-1 sm:w-auto lg:w-80 sm:flex-initial">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Cari produk, merk atau kategori..."
                                    className="h-8 px-2 text-sm pl-10 rounded-xl border-slate-200 focus-visible:ring-slate-400 bg-slate-50/30 w-full"
                                />
                            </div>

                            {/* 📱 MOBILE FILTER TRIGGER (Hanya muncul di layar < lg) */}
                            <div className="lg:hidden">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-12 rounded-xl border-slate-200 bg-slate-50/30 text-slate-600 active:scale-95 transition-transform"
                                        >
                                            <SlidersHorizontal className="h-4 w-4" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent
                                        side="bottom"
                                        className="rounded-t-2xl p-6 min-h-[40vh]"
                                    >
                                        <SheetHeader className="text-left mb-5">
                                            <SheetTitle className="text-base font-semibold tracking-tight">
                                                Filter & Sortir
                                            </SheetTitle>
                                            <SheetDescription>
                                                Pencarian produk lebih mudah
                                            </SheetDescription>
                                        </SheetHeader>

                                        {/* Konten Filter di dalam Mobile Sheet */}
                                        <div className="flex flex-col gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-slate-500">
                                                    Urutkan Berdasarkan
                                                </label>
                                                <Select
                                                    value={sort}
                                                    onValueChange={(value) => {
                                                        setSort(value);
                                                        setPage(1);
                                                    }}
                                                >
                                                    <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/30">
                                                        <div className="flex items-center gap-2">
                                                            <ArrowDownWideNarrowIcon className="h-4 w-4 text-slate-400 shrink-0" />
                                                            <SelectValue placeholder="Terbaru" />
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="createdAt-desc">
                                                            Terbaru
                                                        </SelectItem>
                                                        <SelectItem value="createdAt-asc">
                                                            Terlama
                                                        </SelectItem>
                                                        <SelectItem value="name-asc">
                                                            Nama A-Z
                                                        </SelectItem>
                                                        <SelectItem value="name-desc">
                                                            Nama Z-A
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>

                            {/* 💻 DESKTOP FILTERS (Hanya muncul di layar lg ke atas) */}
                            <div className="hidden lg:flex items-center gap-3">
                                <Select
                                    value={sort}
                                    onValueChange={(value) => {
                                        setSort(value);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/30">
                                        <div className="flex items-center gap-2">
                                            <ArrowDownWideNarrowIcon className="h-4 w-4 text-slate-400 shrink-0" />
                                            <SelectValue placeholder="Terbaru" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="createdAt-desc">
                                            Terbaru
                                        </SelectItem>
                                        <SelectItem value="createdAt-asc">
                                            Terlama
                                        </SelectItem>
                                        <SelectItem value="name-asc">
                                            Nama A-Z
                                        </SelectItem>
                                        <SelectItem value="name-desc">
                                            Nama Z-A
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={categoryId}
                                    onValueChange={(value) => {
                                        setCategoryId(value);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-full  h-11 rounded-xl border-slate-200 focus-visible:ring-slate-400 bg-slate-50/30">
                                        <div className="flex items-center gap-2">
                                            <Palette className="h-4 w-4 text-slate-400 shrink-0" />
                                            <SelectValue placeholder="Status" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {categories.map((option) => (
                                            <SelectItem
                                                key={option.id}
                                                value={option.id}
                                            >
                                                {option.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button
                            asChild
                            className="h-8 w-8 p-0 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all duration-200 md:w-auto md:px-4"
                        >
                            <Link href={`/stores/${storeSlug}/products/create`}>
                                <Plus className="h-4 w-4 shrink-0" />
                                <span className="hidden md:inline md:ml-2 text-xs font-semibold tracking-tight">
                                    Tambah Produk
                                </span>
                            </Link>
                        </Button>
                        {/* Switcher Buttons */}
                        <TabsList className="grid grid-cols-2 min-w-[80px]">
                            <TabsTrigger value="grid" className="px-2 py-1.5">
                                <LayoutGrid className="h-4 w-4" />
                            </TabsTrigger>
                            <TabsTrigger value="list" className="px-2 py-1.5">
                                <List className="h-4 w-4" />
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="grid" className="mt-0">
                        {isLoading ? (
                            <LoadingSection></LoadingSection>
                        ) : (
                            <ProductGrid
                                items={items}
                                handleDetail={handleDetail}
                                handleDelete={handleDelete}
                                handleEdit={handleEdit}
                                isDeleting={isDeleting}
                            ></ProductGrid>
                        )}
                    </TabsContent>
                    <TabsContent value="list" className="mt-0">
                        <ProductTable
                            items={items}
                            numberList={numberList}
                            handleDelete={handleDelete}
                            handleEdit={handleEdit}
                            isDeleting={isDeleting}
                        ></ProductTable>
                    </TabsContent>
                </Tabs>

                <div>
                    <PaginationSection
                        isLoading={isLoading}
                        pagination={pagination}
                        setPage={setPage}
                    ></PaginationSection>
                </div>

                {/* SECTION DEBUGGING CART (Hapus atau beri komentar jika sudah produksi) */}
                {/* <div className="col-span-12 mt-6 p-4 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 font-mono text-xs shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                        <span className="font-bold text-amber-400">
                            🛠️ DEBUGGER: useCartStore Local State
                        </span>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                            Total Jenis Item: {items.length}
                        </span>
                    </div>
                    {items.length === 0 ? (
                        <p className="text-slate-500 italic">
                            [] Array keranjang kosong. Silakan tambah produk...
                        </p>
                    ) : (
                        <pre className="overflow-x-auto max-h-60 overflow-y-auto scrollbar-thin">
                            {JSON.stringify(items, null, 2)}
                        </pre>
                    )}
                </div> */}
            </div>
        </main>
    );
}
