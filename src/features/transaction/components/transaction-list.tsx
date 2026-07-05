"use client";

import React, { useState } from "react";
import {
    Search,
    SlidersHorizontal,
    CalendarDays,
    ArrowDownWideNarrowIcon,
    Wallet2,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTransactions } from "../hooks/use-transactions";
import { FindTransactionsFilters } from "../types";
import { useDebounce } from "@/hooks/use-debounce";
import { PaymentStatus, paymentStatusOptions } from "@/db/schema";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { DatePresetFilters, type DatePreset } from "./date-preset-filters";
import { getPresetDateRange } from "@/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PaginationSection from "@/components/shared/PaginationSection";
import { TransactionGrid } from "./transaction-grid";

interface Props {
    storeId: string;
    storeSlug: string;
}
export default function TransactionList({ storeId, storeSlug }: Props) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(8);
    const [sort, setSort] = useState("createdAt-desc");
    const debouncedSearch = useDebounce(search, 400);
    const [sortBy, sortOrder] = sort.split("-") as [
        "totalAmount" | "createdAt",
        "asc" | "desc",
    ];
    const [paymentStatus, setPaymentStatus] = useState("all");
    // State ditaruh di parent component Anda
    const [activePreset, setActivePreset] = useState<DatePreset>("all");
    const { startDate, endDate } = getPresetDateRange(activePreset);

    const filters: FindTransactionsFilters = {
        storeId: storeId,
        search: debouncedSearch,
        page: page,
        limit: limit,
        sortBy: sortBy,
        sortOrder: sortOrder,
        paymentStatus: paymentStatus as PaymentStatus | "all",
        startDate: startDate,
        endDate: endDate,
    };
    const { data, isLoading } = useTransactions(filters);
    const transactions = data?.items ?? [];
    const pagination = data?.pagination ?? {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1,
    };

    return (
        <main>
            <div className="space-y-4 w-full">
                <div className="flex items-center gap-2 w-full sm:justify-between">
                    {/* 🔍 SEARCH BAR (Muncul di Mobile & Desktop) */}
                    <div className="relative flex-1 sm:w-80 sm:flex-initial">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Cari invoice transaksi..."
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
                                                    <SelectValue placeholder="Urutan" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="createdAt-desc">
                                                    Terbaru
                                                </SelectItem>
                                                <SelectItem value="createdAt-asc">
                                                    Terlama
                                                </SelectItem>
                                                <SelectItem value="totalAmount-asc">
                                                    Terkecil
                                                </SelectItem>
                                                <SelectItem value="totalAmount-desc">
                                                    Terbesar
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-slate-500">
                                            Status Pembayaran
                                        </label>
                                        <Select
                                            value={paymentStatus}
                                            onValueChange={(value) => {
                                                setPaymentStatus(value);
                                                setPage(1);
                                            }}
                                        >
                                            <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/30">
                                                <div className="flex items-center gap-2">
                                                    <Wallet2 className="h-4 w-4 text-slate-400 shrink-0" />
                                                    <SelectValue placeholder="Status" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {paymentStatusOptions.map(
                                                    (option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <DatePresetFilters
                                            activePreset={activePreset}
                                            setActivePreset={setActivePreset}
                                            setPage={setPage}
                                        ></DatePresetFilters>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* 💻 DESKTOP FILTERS (Hanya muncul di layar lg ke atas) */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Select
                            value={activePreset}
                            onValueChange={(value) => {
                                setActivePreset(value as DatePreset);
                                setPage(1); // Selalu reset ke halaman 1 setiap kali filter berubah
                            }}
                        >
                            <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 focus-visible:ring-slate-400 bg-slate-50/30 font-medium text-slate-700">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />
                                    <SelectValue placeholder="Periode" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Semua Waktu</SelectItem>
                                <SelectItem value="today">Hari Ini</SelectItem>
                                <SelectItem value="yesterday">
                                    Kemarin
                                </SelectItem>
                                <SelectItem value="this_week">
                                    Minggu Ini
                                </SelectItem>
                                <SelectItem value="this_month">
                                    Bulan Ini
                                </SelectItem>
                                <SelectItem value="this_year">
                                    Tahun Ini
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={sort}
                            onValueChange={(value) => {
                                setSort(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-full  h-11 rounded-xl border-slate-200 focus-visible:ring-slate-400 bg-slate-50/30">
                                <div className="flex items-center gap-2">
                                    <ArrowDownWideNarrowIcon className="h-4 w-4 text-slate-400 shrink-0" />
                                    <SelectValue placeholder="Urutan" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="createdAt-desc">
                                    Terbaru
                                </SelectItem>
                                <SelectItem value="createdAt-asc">
                                    Terlama
                                </SelectItem>
                                <SelectItem value="totalAmount-asc">
                                    Terkecil
                                </SelectItem>
                                <SelectItem value="totalAmount-desc">
                                    Terbesar
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={paymentStatus}
                            onValueChange={(value) => {
                                setPaymentStatus(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-full  h-11 rounded-xl border-slate-200 focus-visible:ring-slate-400 bg-slate-50/30">
                                <div className="flex items-center gap-2">
                                    <Wallet2 className="h-4 w-4 text-slate-400 shrink-0" />
                                    <SelectValue placeholder="Status" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {paymentStatusOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div>
                    {/* <TransactionTable
                        transactions={transactions}
                    ></TransactionTable> */}
                    <TransactionGrid
                        storeSlug={storeSlug}
                        transactions={transactions}
                    ></TransactionGrid>
                    <PaginationSection
                        pagination={pagination}
                        setPage={setPage}
                        isLoading={isLoading}
                    ></PaginationSection>
                </div>
            </div>
        </main>
    );
}
