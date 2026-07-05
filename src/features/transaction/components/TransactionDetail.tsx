"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Receipt,
    User,
    Calendar,
    CreditCard,
    Printer,
    CheckCircle2,
    AlertCircle,
    Clock,
    Download,
    Coins,
    Package,
    ClockAlert,
    Wallet,
    HandCoins,
    DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatters } from "@/utils"; // Gunakan utils format Anda
import { PaymentMethod } from "@/db/schema";
import { useTransaction } from "../hooks/use-transaction";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getStatusConfig } from "./transaction-grid";
import InstallmentPaymentModal from "./InstallmentPaymentModal";
import { usePaymentMutation, usePaymentRequest } from "../hooks/use-payment";

export function TransactionDetail({
    storeSlug,
    id,
}: {
    id: string;
    storeSlug: string;
}) {
    const router = useRouter();
    const { data: tx, isLoading } = useTransaction(id, storeSlug);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { mutateAsync, isPending } = usePaymentMutation();

    // ==========================================
    // 1. TANGANI EFEK SAMPING (TOAST & REDIRECT)
    // ==========================================
    useEffect(() => {
        // Jalankan HANYA jika loading sudah selesai DAN data memang tidak ditemukan
        if (!isLoading && !tx) {
            toast.error("Data Transaksi tidak ditemukan");
            router.push(`/stores/${storeSlug}/transactions`);
        }
    }, [tx, isLoading, storeSlug, router]);

    // ==========================================
    // 2. EARLY RETURN UNTUK STATE LOADING
    // ==========================================
    if (isLoading) {
        return <div>Memuat data transaksi...</div>; // Bisa diganti Skeleton Loader
    }

    // ==========================================
    // 3. EARLY RETURN UNTUK STATE DATA KOSONG
    // ==========================================
    // Return UI minimal agar kode di bawah tidak dieksekusi saat redirect sedang berjalan
    if (!tx) {
        return null;
    }

    // ==========================================
    // 4. KODE AMAN DIEKSEKUSI (Data Pasti Ada)
    // ==========================================
    const status = getStatusConfig(tx.paymentStatus);
    const totalPaid = tx.transactionPayments.reduce(
        (acc, p) => acc + parseInt(p.amountPaid),
        0,
    );
    const remainingBill = parseInt(tx.totalAmount) - totalPaid;

    const handleSubmitPayment = async (
        amount: number,
        method: string,
        note: string,
    ) => {
        try {
            if (note == "") {
                const seq = tx.transactionPayments
                    ? tx.transactionPayments.length + 1
                    : 1;
                note = `Pembayaran cicilan ke-${seq}`;
            }
            console.log(">>>", note);
            const payload: usePaymentRequest = {
                storeSlug: storeSlug,
                transactionId: tx.id,
                amountPaid: amount,
                paymentMethod: method,
                note: note,
            };
            await mutateAsync(payload);

            setIsModalOpen(false); // 3. Tutup modal setelah sukses

            // if (mutate) mutate(); // Refresh data transaksi agar sisa tagihan terupdate otomatis
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan, silakan coba lagi");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* ─── HEADER BAR & ACTIONS ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="rounded-xl h-10 w-10 shrink-0"
                    >
                        <Link href={`/stores/${storeSlug}/transactions`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white break-all">
                                {tx.invoiceNumber}
                            </h1>
                            <Badge
                                variant="outline"
                                className={`rounded-full font-bold text-[11px] px-2.5 py-0.5 flex items-center gap-1 shrink-0 ${status.className}`}
                            >
                                {status.icon} <span>{status.label}</span>
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                            ID: {tx.id}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-semibold text-xs gap-1.5 h-9"
                    >
                        <Download className="h-3.5 w-3.5" /> Unduh PDF
                    </Button>
                    <Button
                        size="sm"
                        className="rounded-xl font-semibold text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 shadow-sm h-9 text-white"
                    >
                        <Printer className="h-3.5 w-3.5" /> Cetak Struk
                    </Button>
                </div>
            </div>

            {/* ─── UTAMA: SPLIT GRID LAYOUT ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* KOLOM KIRI (2/3): INFORMASI BARANG & RIWAYAT BAYAR */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Box 1: Daftar Produk Belanja */}
                    <div className="rounded-2xl border bg-card text-card-foreground shadow-xs overflow-hidden">
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border-b flex items-center gap-2">
                            <Package className="h-4 w-4 text-slate-500" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Manifes Produk ({tx.transactionItems.length})
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {tx.transactionItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-4 flex justify-between items-center gap-4 text-sm hover:bg-slate-50/30 transition-colors"
                                >
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                            {item.productName}
                                        </p>
                                        <div className="flex flex-wrap gap-x-2 items-center text-xs text-muted-foreground mt-0.5 font-medium">
                                            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-normal">
                                                {item.variantSku}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                Merk: {item.productMerk || "-"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-slate-800 dark:text-slate-200">
                                            Rp{" "}
                                            {formatCurrency(
                                                item.subtotal,
                                                "id-ID",
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-mono">
                                            {item.quantity} x Rp{" "}
                                            {formatCurrency(
                                                item.price,
                                                "id-ID",
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Box 2: Alur Riwayat Pembayaran (Termin/Installment) */}
                    <div className="rounded-2xl border bg-card text-card-foreground shadow-xs overflow-hidden">
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border-b flex items-center gap-2">
                            <Coins className="h-4 w-4 text-slate-500" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Log Aliran Dana / Payments
                            </h2>
                        </div>
                        <div className="p-4 space-y-3">
                            {tx.transactionPayments.length < 1 && (
                                <div className="flex justify-between items-center p-3 rounded-xl border bg-slate-50/30 dark:bg-slate-900/10 text-xs">
                                    <div className="space-y-1">
                                        <p className="font-bold text-slate-700 dark:text-slate-300">
                                            Belum ada pembayaran
                                        </p>
                                    </div>
                                </div>
                            )}
                            {tx.transactionPayments.map((payment, idx) => (
                                <div
                                    key={payment.id}
                                    className="flex justify-between items-center p-3 rounded-xl border bg-slate-50/30 dark:bg-slate-900/10 text-xs"
                                >
                                    <div className="space-y-1">
                                        <p className="font-bold text-slate-700 dark:text-slate-300">
                                            {payment.notes}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                                {payment.createdAt
                                                    ? formatDate(
                                                          payment.createdAt,
                                                          formatters.date,
                                                      )
                                                    : "Menunggu Konfirmasi"}
                                            </span>
                                            <Badge
                                                className={`text-[11px] px-1.5 py-1.5 font-bold border-none rounded-md ${
                                                    payment.paymentMethod ===
                                                    PaymentMethod.CASH
                                                        ? "bg-emerald-500/10 text-emerald-600 animate-pulse"
                                                        : payment.paymentMethod ===
                                                            PaymentMethod.TRANSFER
                                                          ? "bg-sky-500/10 text-sky-600 animate-pulse"
                                                          : "bg-purple-500/10 text-purple-600 animate-pulse"
                                                }`}
                                            >
                                                {payment.paymentMethod ===
                                                PaymentMethod.CASH ? (
                                                    <Wallet></Wallet>
                                                ) : payment.paymentMethod ===
                                                  PaymentMethod.TRANSFER ? (
                                                    <CreditCard></CreditCard>
                                                ) : (
                                                    <DollarSign></DollarSign>
                                                )}
                                                {payment.paymentMethod.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="font-extrabold text-sm font-mono text-slate-800 dark:text-slate-200">
                                            Rp{" "}
                                            {formatCurrency(
                                                payment.amountPaid,
                                                "id-ID",
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {remainingBill > 0 && (
                                <div>
                                    <Button
                                        onClick={() => setIsModalOpen(true)}
                                        size="sm"
                                        className="rounded-xl font-semibold hover:cursor-pointer text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 shadow-sm h-9 text-white"
                                    >
                                        <HandCoins className="h-3.5 w-3.5" />{" "}
                                        Bayar Sisa Utang
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* KOLOM KANAN (1/3): STRUK BELANJA RINGKAS (DIGITAL RECEIPT VIEW) */}
                <div className="rounded-2xl border bg-card text-card-foreground shadow-md overflow-hidden relative border-slate-200/80 dark:border-slate-800">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="p-5 space-y-5">
                        {/* Kop Nota Singkat */}
                        <div className="text-center space-y-1 pt-2">
                            <p className="text-sm font-extrabold tracking-wider text-muted-foreground uppercase">
                                Ringkasan Nota Penjualan
                            </p>
                            <p className="font-mono text-sm text-slate-500">
                                {formatDate(tx.createdAt, formatters.dateTime)}
                            </p>
                        </div>

                        {/* Meta Kasir */}
                        <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl space-y-2 text-xs">
                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                <span className="flex items-center gap-1 text-slate-400 font-medium">
                                    <User className="h-3.5 w-3.5" /> Operator
                                    Kasir
                                </span>
                                <span className="font-bold">
                                    {tx.cashierName}
                                </span>
                            </div>
                            {/* {tx.isInstallment && (
                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 border-t border-slate-200/50 dark:border-slate-800/50 pt-2">
                                    <span className="flex items-center gap-1 text-slate-400 font-medium">
                                        <CreditCard className="h-3.5 w-3.5" />{" "}
                                        Jatuh Tempo Tenor
                                    </span>
                                    <span className="font-bold text-amber-600 dark:text-amber-400">
                                        {tx.dueDate
                                            ? formatDate(
                                                  tx.dueDate,
                                                  formatters.date,
                                              )
                                            : "-"}
                                    </span>
                                </div>
                            )} */}
                        </div>

                        {/* Matematika Perhitungan Biaya */}
                        <div className="space-y-2.5 text-xs border-t border-dashed pt-4 border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between text-muted-foreground font-medium">
                                <span>Subtotal Barang</span>
                                <span className="font-mono font-semibold">
                                    Rp {formatCurrency(tx.subtotal, "id-ID")}
                                </span>
                            </div>
                            <div className="flex justify-between text-rose-500 font-medium">
                                <span className="line-through">
                                    Potongan Diskon
                                </span>
                                <span className="font-mono font-semibold">
                                    - Rp {formatCurrency(tx.discount, "id-ID")}
                                </span>
                            </div>
                            <div className="flex justify-between text-muted-foreground font-medium">
                                <span className="line-through">
                                    Pajak (PPN 11%)
                                </span>
                                <span className="font-mono font-semibold">
                                    Rp {formatCurrency(tx.tax, "id-ID")}
                                </span>
                            </div>

                            {/* Grand Total */}
                            <div className="flex justify-between items-baseline pt-3 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    Total Akhir Nota
                                </span>
                                <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">
                                    Rp {formatCurrency(tx.totalAmount, "id-ID")}
                                </span>
                            </div>
                        </div>

                        {/* Status Sisa Piutang (Jika Partial/Cicilan) */}
                        {tx.isInstallment && (
                            <div className="rounded-xl border border-dashed p-3 bg-indigo-50/20 dark:bg-indigo-950/10 space-y-2 text-xs">
                                <div className="flex justify-between font-medium text-slate-500">
                                    <span>Dana Masuk (Paid)</span>
                                    <span className="font-mono font-bold text-emerald-600">
                                        Rp{" "}
                                        {formatCurrency(
                                            totalPaid.toString(),
                                            "id-ID",
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 border-t border-indigo-100/40 dark:border-indigo-900/40 pt-2">
                                    <span>Sisa Piutang Toko</span>
                                    <span className="font-mono font-extrabold text-rose-500">
                                        Rp{" "}
                                        {formatCurrency(
                                            remainingBill.toString(),
                                            "id-ID",
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <InstallmentPaymentModal
                    key={tx.id}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)} // Mengubah state jadi false untuk menutup modal
                    remainingBill={remainingBill} // Mengirim data sisa tagihan ke modal
                    onSubmitPayment={handleSubmitPayment} // Mengirim fungsi submit ke modal
                />
            )}
        </div>
    );
}
