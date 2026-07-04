"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/features/cashier/store/useCartStore";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Landmark } from "lucide-react";
import { toast } from "sonner";
import { useCheckoutMutation } from "@/features/transaction/hooks/use-checkout";
import { ProfileRow } from "@/db/schema";

interface PaymentModalProps {
    profile: ProfileRow;
    storeSlug: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PaymentModal({
    profile,
    storeSlug,
    isOpen,
    onOpenChange,
}: PaymentModalProps) {
    const { cart, getTotals, clearCart, setSheetOpen } = useCartStore();
    const { subTotal, tax, grandTotal } = getTotals();

    const [paymentStatus, setPaymentStatus] = useState<"cash" | "credit">(
        "cash",
    );
    const [cashAmount, setCashAmount] = useState<number>(0);

    function handlePaymentStatus(val: "cash" | "credit") {
        setPaymentStatus(val);
        setCashAmount(0);
    }

    const cashBack = cashAmount > grandTotal ? cashAmount - grandTotal : 0;
    const remainingDebt = grandTotal > cashAmount ? grandTotal - cashAmount : 0;

    const { mutateAsync: checkout, isPending } = useCheckoutMutation(storeSlug);

    const handleCheckoutSubmit = async () => {
        try {
            if (cart.length === 0) {
                toast.error("Keranjang masih kosong");
                return;
            }

            let isInstallment = false;
            if (paymentStatus === "cash") {
                if (cashAmount < grandTotal) {
                    toast.error("Nominal pembayaran kurang!");
                    return;
                }
            } else {
                isInstallment = true;
                if (cashAmount >= grandTotal) {
                    toast.error(
                        "Pembayaran melebihi tagihan, silahkan gunakan transaksi Tunai(Lunas)",
                    );
                    return;
                }
            }

            const payload = {
                cashierName: profile.fullName,
                cart,
                isInstallment: isInstallment,
                paymentMethod: "cash",
                subTotal: subTotal,
                tax: tax,
                grandTotal: grandTotal,
                cashAmount: cashAmount,
            };
            await checkout(payload);
        } catch (error) {
            console.error(error);
        }

        // Reset status lokal & kosongkan keranjang belanja setelah sukses
        clearCart();
        onOpenChange(false);
        setCashAmount(0);
        setSheetOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-center text-muted-foreground font-medium text-sm uppercase tracking-wider">
                        Konfirmasi Pembayaran
                    </DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>

                <div className="text-center py-2">
                    <span className="text-xs text-muted-foreground">
                        TOTAL TAGIHAN
                    </span>
                    <h2 className="text-4xl font-black text-emerald-500 mt-0.5">
                        Rp {grandTotal.toLocaleString("id-ID")}
                    </h2>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">
                        Status Pembayaran
                    </Label>
                    <Tabs
                        defaultValue="cash"
                        onValueChange={(val) =>
                            handlePaymentStatus(val as "cash" | "credit")
                        }
                    >
                        <TabsList className="grid w-full grid-cols-2 h-11 bg-muted p-1 rounded-lg">
                            <TabsTrigger
                                value="cash"
                                className="font-semibold text-xs rounded-md gap-1.5 data-[state=active]:bg-background data-[state=active]:text-primary"
                            >
                                <Wallet className="h-3.5 w-3.5" /> Tunai (Lunas)
                            </TabsTrigger>
                            <TabsTrigger
                                value="credit"
                                className="font-semibold text-xs rounded-md gap-1.5 data-[state=active]:bg-amber-600 data-[state=active]:text-white"
                            >
                                <Landmark className="h-3.5 w-3.5" /> Cicilan
                                (Credit)
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="space-y-4 min-h-[130px] p-4 bg-muted/30 rounded-xl border border-dashed">
                    {paymentStatus === "cash" ? (
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="cash-input"
                                    className="text-xs font-medium"
                                >
                                    Uang yang Diterima
                                </Label>
                                <Input
                                    id="cash-input"
                                    type="number"
                                    value={cashAmount === 0 ? "" : cashAmount}
                                    placeholder="Masukkan nominal..."
                                    className="text-lg font-bold py-5"
                                    onChange={(e) =>
                                        setCashAmount(
                                            Number(e.target.value) || 0,
                                        )
                                    }
                                />
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Kembalian:
                                </span>
                                <span
                                    className={`text-lg font-black ${cashBack >= 0 ? "text-emerald-500" : "text-destructive"}`}
                                >
                                    Rp{" "}
                                    {cashBack >= 0
                                        ? cashBack.toLocaleString("id-ID")
                                        : "0"}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="dp-input"
                                    className="text-xs font-medium"
                                >
                                    Uang Muka / DP
                                </Label>
                                <Input
                                    id="dp-input"
                                    type="number"
                                    value={cashAmount === 0 ? "" : cashAmount}
                                    placeholder="Ketik 0 jika tanpa DP..."
                                    className="text-lg font-bold py-5 text-amber-600 focus-visible:ring-amber-500"
                                    onChange={(e) =>
                                        setCashAmount(
                                            Number(e.target.value) || 0,
                                        )
                                    }
                                />
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Sisa Piutang:
                                </span>
                                <span className="text-lg font-black text-amber-600">
                                    Rp{" "}
                                    {remainingDebt >= 0
                                        ? remainingDebt.toLocaleString("id-ID")
                                        : "0"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <Button
                    disabled={isPending}
                    size="lg"
                    className={`w-full font-bold text-base py-5 rounded-xl transition-all ${
                        paymentStatus === "credit"
                            ? "bg-amber-600 hover:bg-amber-700 text-white"
                            : "bg-primary hover:opacity-90"
                    }`}
                    onClick={handleCheckoutSubmit}
                >
                    {paymentStatus === "credit"
                        ? "Simpan Transaksi Cicilan"
                        : "Selesaikan & Cetak Nota"}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
