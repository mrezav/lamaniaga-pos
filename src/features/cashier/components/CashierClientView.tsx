"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useCartStore } from "@/features/cashier/store/useCartStore";
import { ProductCard } from "@/features/cashier/components/ProductCard";
import { CartItemRow } from "@/features/cashier/components/CartItemRow";
import { PaymentModal } from "@/features/cashier/components/PaymentModal";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ArrowUp, Loader2, Search, ShoppingCart } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useCategoryList } from "@/features/category/hooks/use-categories";
import { useProfile } from "@/features/user/hooks/use-profile";
import CashierHeader from "./CashierHeader";
import { ProfileRow } from "@/db/schema";
import LoadingSection from "@/components/shared/LoadingSection";
import EmptySection from "@/components/shared/EmptySection";
import { useInView } from "@/hooks/use-in-view"; // Import hook useInView milikmu
import { useInfiniteProducts } from "@/features/product/hooks/use-infinite-products";
import ScrollContainer from "react-indiana-drag-scroll";

interface Props {
    storeSlug: string;
}

export default function CashierClientView({ storeSlug }: Props) {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("createdAt-desc");
    const debouncedSearch = useDebounce(search, 400);
    const [sortBy, sortOrder] = sort.split("-") as [
        "name" | "createdAt",
        "asc" | "desc",
    ];
    const [categoryId, setCategoryId] = useState("all");

    const { cart, clearCart, getTotals, isSheetOpen, setSheetOpen } =
        useCartStore();
    const { subTotal, tax, grandTotal } = getTotals();
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const { data: profileResponse } = useProfile();
    const defaultProfile: ProfileRow = {
        id: "",
        fullName: "",
        avatarUrl: null,
        phoneNumber: null,
        createdAt: null,
        updatedAt: null,
        deletedAt: null,
        lastActiveStoreId: null,
    };
    const profile = profileResponse?.data ?? defaultProfile;

    const { data: categoryList } = useCategoryList(storeSlug);
    const categories = [{ id: "all", name: "Semua" }, ...(categoryList ?? [])];

    // 1. Panggil useProducts versi Infinite Query
    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useInfiniteProducts({
            storeSlug,
            categoryId,
            search: debouncedSearch,
            limit: 8,
            sortBy,
            sortOrder,
        });

    // Menggabungkan semua array items dari setiap page menjadi satu array tunggal
    const products = data?.pages.flatMap((page) => page?.items ?? []) ?? [];

    // 2. Pasang Intersection Observer lewat useInView
    const { sentinelRef, inView } = useInView({
        rootMargin: "100px",
    });

    // 3. Effect untuk Infinite Scroll
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Ref biasa untuk menyimpan node elemen agar bisa dipanggil fungsi scrollToTop
    const scrollContainerNode = useRef<HTMLDivElement | null>(null);
    const [showBackToTop, setShowBackToTop] = useState(false);

    // 1. Callback Ref untuk otomatis memasang listener saat elemen scroll terpasang ke DOM
    const scrollContainerRef = useCallback((node: HTMLDivElement | null) => {
        if (node !== null) {
            scrollContainerNode.current = node;

            const handleScroll = () => {
                // console.log("Current Scroll Top:", node.scrollTop);

                if (node.scrollTop > 500) {
                    setShowBackToTop(true);
                } else {
                    setShowBackToTop(false);
                }
            };

            // Pasang listener langsung begitu elemen di-render ke DOM
            node.addEventListener("scroll", handleScroll);

            // (Opsional) Langsung jalankan sekali untuk cek posisi awal
            handleScroll();
        }
    }, []);

    // 2. Fungsi Smooth Scroll ke Atas
    const scrollToTop = () => {
        scrollContainerNode.current?.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div className="flex h-dvh w-screen flex-col bg-background text-foreground overflow-hidden">
            <CashierHeader profile={profile} />

            <div className="grid flex-1 grid-cols-12 overflow-hidden p-3 lg:p-4 gap-4">
                {/* KATALOG PRODUK */}
                <div className="relative col-span-12 lg:col-span-7 flex flex-col bg-card rounded-xl border shadow-sm p-4 overflow-hidden h-full">
                    {/* SEARCH BAR */}
                    <div className="relative mb-3 shrink-0">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Cari atau scan... (F1)"
                            className="pl-9 py-5 bg-muted/50"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* KATEGORI */}
                    <ScrollContainer className="flex gap-2 overflow-x-auto pb-3 shrink-0 scrollbar-none">
                        {categories.map((cat) => {
                            const isActive = cat.id === categoryId;
                            return (
                                <Button
                                    key={cat.id}
                                    onClick={() => setCategoryId(cat.id)}
                                    variant={isActive ? "default" : "outline"}
                                    className="rounded-full shrink-0 text-xs px-4"
                                >
                                    {cat.name}
                                </Button>
                            );
                        })}
                    </ScrollContainer>

                    {/* KONTEN UTAMA PRODUK */}
                    {isLoading ? (
                        <div className="flex-1 flex justify-center items-center">
                            <LoadingSection />
                        </div>
                    ) : products.length < 1 ? (
                        <div className="flex-1 flex justify-center items-center">
                            <EmptySection />
                        </div>
                    ) : (
                        /* KONTENER SCROLL PRODUK (Ditambahkan Ref) */
                        <div
                            ref={scrollContainerRef}
                            className="relative flex-1 overflow-y-auto pr-1"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 items-start">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>

                            {/* ELEMEN SENTINEL */}
                            <div
                                ref={sentinelRef}
                                className="h-12 w-full flex items-center justify-center my-2"
                            >
                                {isFetchingNextPage && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        <span>Memuat produk lainnya...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TOMBOL BACK TO TOP (FLOATING) */}
                    {showBackToTop && (
                        <Button
                            onClick={scrollToTop}
                            size="icon"
                            className="absolute bottom-6 right-6 rounded-full shadow-lg z-20 animate-in fade-in zoom-in duration-200"
                            title="Kembali ke atas"
                        >
                            <ArrowUp className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                {/* SIDEBAR KERANJANG (DESKTOP) */}
                <div className="hidden lg:flex lg:col-span-5 flex-col gap-4 overflow-hidden">
                    <div className="flex-1 bg-card rounded-xl border shadow-sm p-4 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between border-b pb-2 mb-2">
                            <span className="font-semibold text-sm flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4" /> Keranjang (
                                {cart.reduce((a, c) => a + c.quantity, 0)})
                            </span>
                            {cart.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-destructive h-7"
                                    onClick={clearCart}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1">
                            {cart.map((item) => (
                                <CartItemRow key={item.id} item={item} />
                            ))}
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border shadow-sm p-4 space-y-3">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-muted-foreground">
                                Total Harga
                            </span>
                            <span className="text-l font-bold tabular-nums">
                                Rp {subTotal.toLocaleString("id-ID")}
                            </span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-muted-foreground line-through">
                                PPN 11%
                            </span>
                            <span className="text-l font-black text-pink-500">
                                Rp {tax.toLocaleString("id-ID")}
                            </span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm font-medium text-muted-foreground">
                                Total Tagihan
                            </span>
                            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                Rp {grandTotal.toLocaleString("id-ID")}
                            </span>
                        </div>
                        <Button
                            size="lg"
                            className="w-full font-bold"
                            disabled={cart.length === 0}
                            onClick={() => {
                                console.log(document.activeElement);
                                setIsPaymentOpen(true);
                            }}
                        >
                            PROSES BAYAR (F2)
                        </Button>
                    </div>
                </div>
            </div>

            {/* MOBILE BOTTOM NAV */}
            <div className="lg:hidden flex items-center justify-between p-3 bg-card border-t shrink-0">
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                        Total Belanja
                    </span>
                    <span className="text-lg font-black text-emerald-500">
                        Rp {grandTotal.toLocaleString("id-ID")}
                    </span>
                </div>

                <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                        <Button className="font-bold gap-2">
                            <ShoppingCart className="h-4 w-4" /> Keranjang (
                            {cart.reduce((a, c) => a + c.quantity, 0)})
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="bottom"
                        className="h-[80vh] rounded-t-2xl flex flex-col p-4"
                    >
                        <SheetHeader className="border-b pb-2 shrink-0">
                            <div className="flex items-center justify-between">
                                <SheetTitle className="text-base font-bold flex items-center gap-2">
                                    Keranjang Belanja
                                </SheetTitle>
                                <SheetDescription>
                                    {cart.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-destructive h-7"
                                            onClick={clearCart}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </SheetDescription>
                            </div>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto">
                            {cart.map((item) => (
                                <CartItemRow key={item.id} item={item} />
                            ))}
                        </div>
                        <div className="border-t pt-3 space-y-3 shrink-0">
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm text-muted-foreground">
                                    Total Harga
                                </span>
                                <span className="text-l font-black text-gray-500">
                                    Rp {subTotal.toLocaleString("id-ID")}
                                </span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm text-muted-foreground">
                                    PPN 11%
                                </span>
                                <span className="text-l font-black text-pink-500">
                                    Rp {tax.toLocaleString("id-ID")}
                                </span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm text-muted-foreground">
                                    Total Tagihan
                                </span>
                                <span className="text-2xl font-black text-emerald-500">
                                    Rp {grandTotal.toLocaleString("id-ID")}
                                </span>
                            </div>
                            <Button
                                size="lg"
                                className="w-full font-bold py-5 rounded-xl"
                                disabled={cart.length === 0}
                                onClick={() => setIsPaymentOpen(true)}
                            >
                                Bayar Sekarang
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* GLOBAL PAYMENT DIALOG */}
            <PaymentModal
                profile={profile}
                storeSlug={storeSlug}
                isOpen={isPaymentOpen}
                onOpenChange={setIsPaymentOpen}
            />

            {/* SECTION DEBUGGING CART (Hapus atau beri komentar jika sudah produksi) */}
            {/* <div className="col-span-12 mt-6 p-4 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="font-bold text-amber-400">
                        🛠️ DEBUGGER: useCartStore Local State
                    </span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                        Total Jenis Item: {cart.length}
                    </span>
                </div>
                {cart.length === 0 ? (
                    <p className="text-slate-500 italic">
                        [] Array keranjang kosong. Silakan tambah produk...
                    </p>
                ) : (
                    <pre className="overflow-x-auto max-h-60 overflow-y-auto scrollbar-thin">
                        {JSON.stringify(cart, null, 2)}
                    </pre>
                )}
            </div> */}
        </div>
    );
}
