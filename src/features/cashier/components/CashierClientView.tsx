"use client";

import { useState } from "react";
import { useCartStore } from "@/features/cashier/store/useCartStore";
import { ProductCard } from "@/features/cashier/components/ProductCard";
import { CartItemRow } from "@/features/cashier/components/CartItemRow";
import { PaymentModal } from "@/features/cashier/components/PaymentModal";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Search, ShoppingCart } from "lucide-react";
import { useProducts } from "@/features/product/hooks/use-products";
import { useDebounce } from "@/hooks/use-debounce";
import { useCategories } from "@/features/category/hooks/use-categories";
import { useProfile } from "@/features/user/hooks/use-profile";
import CashierHeader from "./CashierHeader";
import { ProfileRow } from "@/db/schema";

interface Props {
    storeSlug: string;
}
export default function CashierClientView({ storeSlug }: Props) {
    const { cart, clearCart, getTotals } = useCartStore();
    const { subTotal, tax, grandTotal } = getTotals();
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const inputSearch = "";

    const { data: profileResponse } = useProfile();
    const defaultProfile: ProfileRow = {
        id: "",
        fullName: "",
        avatarUrl: null,
        phoneNumber: null,
        createdAt: null,
        updatedAt: null,
        lastActiveStoreId: null,
    };
    const profile = profileResponse?.data ?? defaultProfile;

    const [activeCategory, setActiveCategory] = useState("all");
    const { getCategoryListQuery } = useCategories({ storeSlug });
    const { data: categoryListData, error: errorCategory } =
        getCategoryListQuery;
    // Menyisipkan opsi "Semua" di awal array secara dinamis
    const categories = [
        { id: "all", name: "Semua" }, // Object mock untuk me-reset filter
        ...(categoryListData ?? []),
    ];

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
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
        limit: limit,
        sortBy,
        sortOrder,
    });
    const items = data?.items ?? [];

    return (
        <div className="flex h-screen w-screen flex-col bg-background text-foreground overflow-hidden">
            {/* NAVBAR */}
            {/* <header className="flex h-14 items-center justify-between border-b bg-card px-4 shrink-0">
                <span className="font-black text-xl tracking-tight text-primary">
                    Lamaniaga<span className="text-emerald-500">.pos</span>
                </span>
                <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1"
                >
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
                    Online
                </Badge>
            </header> */}
            <CashierHeader profile={profile}></CashierHeader>
            {/* BODY GRID */}
            <div className="grid flex-1 grid-cols-12 overflow-hidden p-3 lg:p-4 gap-4">
                {/* KATALOG PRODUK */}
                <div className="col-span-12 lg:col-span-7 flex flex-col bg-card rounded-xl border shadow-sm p-4 overflow-hidden">
                    <div className="relative mb-3 shrink-0">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Cari atau scan... (F1)"
                            className="pl-9 py-5 bg-muted/50"
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-3 shrink-0 scrollbar-none">
                        {categories.map((cat) => {
                            // Menyisipkan opsi "Semua" di awal array secara dinamis
                            const isActive = cat.id === activeCategory;
                            return (
                                <Button
                                    key={cat.id}
                                    onClick={() => {
                                        setActiveCategory(cat.id);
                                        if (cat.id == "all") {
                                            setSearch("");
                                        } else {
                                            setSearch(cat.name);
                                        }
                                        // TIPS UX: Jika klik kategori, biasanya kita reset halaman ke page 1
                                        setPage(1);
                                    }}
                                    variant={isActive ? "default" : "outline"}
                                    className="rounded-full shrink-0 text-xs px-4"
                                >
                                    {cat.name}
                                </Button>
                            );
                        })}
                    </div>

                    <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 items-start">
                        {items.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
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

                <Sheet>
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
