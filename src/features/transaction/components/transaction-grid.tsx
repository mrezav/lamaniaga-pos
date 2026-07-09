import React from "react";
import {
    User,
    Receipt,
    Calendar,
    Layers,
    CheckCircle2,
    AlertCircle,
    Clock,
    XCircle,
    HelpCircle,
    ClockAlert,
    Wallet,
    CalendarRange,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatters } from "@/utils";
import { TransactionWithItems } from "../repositories/find-many";
import { PaymentStatus, paymentStatusOptions } from "@/db/schema";
import Link from "next/link";

interface TransactionGridProps {
    storeSlug: string;
    transactions: TransactionWithItems[];
}

// 2. HELPER UNTUK MENDAPATKAN BADGE STATUS PEMBAYARAN YANG ELEGAN
export const getStatusConfig = (
    status: TransactionWithItems["paymentStatus"],
) => {
    switch (status) {
        case PaymentStatus.PAID:
            return {
                label: paymentStatusOptions.find(
                    (val) => val.value == PaymentStatus.PAID,
                )?.label,
                className:
                    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                icon: <CheckCircle2 className="h-3 w-3 mr-1 shrink-0" />,
            };
        case PaymentStatus.UNPAID:
            return {
                label: paymentStatusOptions.find(
                    (val) => val.value == PaymentStatus.UNPAID,
                )?.label,
                className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
                icon: <AlertCircle className="h-3 w-3 mr-1 shrink-0" />,
            };
        case PaymentStatus.PARTIAL:
            return {
                label: paymentStatusOptions.find(
                    (val) => val.value == PaymentStatus.PARTIAL,
                )?.label,
                className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
                icon: <Clock className="h-3 w-3 mr-1 shrink-0" />,
            };
        case PaymentStatus.OVERDUE:
            return {
                label: paymentStatusOptions.find(
                    (val) => val.value == PaymentStatus.OVERDUE,
                )?.label,
                className: "bg-rose-500/10 text-rose-600 border-rose-500/20",
                icon: <ClockAlert className="h-3 w-3 mr-1 shrink-0" />,
            };
        case PaymentStatus.FAILED:
            return {
                label: paymentStatusOptions.find(
                    (val) => val.value == PaymentStatus.FAILED,
                )?.label,
                className: "bg-slate-500/10 text-slate-600 border-slate-500/20",
                icon: <XCircle className="h-3 w-3 mr-1 shrink-0" />,
            };
        default:
            return {
                label: "Unknown",
                className: "bg-slate-100 text-slate-500 border-slate-200",
                icon: <HelpCircle className="h-3 w-3 mr-1 shrink-0" />,
            };
    }
};

// 2. HELPER UNTUK MENDAPATKAN BADGE STATUS PEMBAYARAN YANG ELEGAN
const getStatusTheme = (status: string) => {
    switch (status) {
        case PaymentStatus.PAID:
            return {
                cardBg: "from-emerald-500/10 via-emerald-500/5 to-transparent",
                accentBar: "bg-emerald-500",
                invoiceText:
                    "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
            };
        case PaymentStatus.UNPAID:
            return {
                cardBg: "from-amber-500/10 via-amber-500/5 to-transparent",
                accentBar: "bg-amber-500",
                invoiceText:
                    "group-hover:text-amber-600 dark:group-hover:text-amber-400",
            };
        case PaymentStatus.PARTIAL:
            return {
                cardBg: "from-blue-500/10 via-blue-500/5 to-transparent",
                accentBar: "bg-blue-600",
                invoiceText:
                    "group-hover:text-blue-600 dark:group-hover:text-blue-400",
            };
        case PaymentStatus.OVERDUE:
            return {
                cardBg: "from-rose-500/10 via-rose-500/5 to-transparent",
                accentBar: "bg-rose-500",
                invoiceText:
                    "group-hover:text-rose-600 dark:group-hover:text-rose-400",
            };
        default:
            return {
                cardBg: "from-slate-500/10 via-slate-500/5 to-transparent",
                accentBar: "bg-slate-500",
                invoiceText:
                    "group-hover:text-slate-700 dark:group-hover:text-slate-300",
            };
    }
};

export function TransactionGrid({
    storeSlug,
    transactions,
}: TransactionGridProps) {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-3xl min-h-60 bg-card">
                <div className="p-4 bg-slate-50 rounded-2xl dark:bg-slate-900 mb-3">
                    <Receipt className="h-8 w-8 text-slate-400 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                    Tidak ada riwayat transaksi
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Ubah parameter filter atau buat invoice penjualan baru.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 p-1">
            {transactions.map((tx) => {
                const status = getStatusConfig(tx.paymentStatus);
                const theme = getStatusTheme(tx.paymentStatus);
                const totalItemsCount = tx.transactionItems.reduce(
                    (acc, item) => acc + parseInt(item.quantity || "0"),
                    0,
                );

                return (
                    <Link
                        href={`/stores/${storeSlug}/transactions/${tx.id}`}
                        key={tx.id}
                        className="group relative rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 overflow-hidden flex flex-col justify-between border-slate-200/60 dark:border-slate-800"
                    >
                        {/* Garis Aksen Vertikal Indikator Status di Sisi Kiri */}
                        <div
                            className={`absolute left-0 top-0 bottom-0 w-1 ${theme.accentBar} z-10`}
                        />

                        {/* ─── Bagian Atas: Header Kartu dengan Gradien Lembut ─── */}
                        <div
                            className={`p-4 space-y-4 bg-gradient-to-b ${theme.cardBg} transition-colors duration-300`}
                        >
                            <div className="space-y-2">
                                {/* Baris 1: Full Nomor Invoice (Sangat Aman & Jelas) */}
                                <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight text-foreground break-all">
                                    <Receipt className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span>{tx.invoiceNumber}</span>
                                </div>

                                {/* Baris 2: Meta Info & Status */}
                                <div className="flex justify-between items-center gap-2">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                                        <User className="h-3 w-3 shrink-0" />
                                        <span className="truncate">
                                            Kasir: {tx.cashierName}
                                        </span>{" "}
                                        {/* Kasir yang dikorbankan truncate jika sangat sempit */}
                                    </div>

                                    <Badge
                                        onClick={(e) => e.stopPropagation()}
                                        variant="outline"
                                        className={`rounded-full font-bold text-[10px] tracking-wide px-2.5 py-0.5 shrink-0 whitespace-nowrap bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm ${status.className}`}
                                    >
                                        {status.icon}
                                        <span className="ml-1">
                                            {status.label}
                                        </span>
                                    </Badge>
                                </div>
                            </div>

                            {/* Garis Pembatas Halus */}
                            <div className="border-t border-slate-200/40 dark:border-slate-700/30 my-1 pl-1" />

                            {/* ─── Bagian Tengah: Preview Item Produk Moduler ─── */}
                            <div className="space-y-2 pl-1">
                                <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                                    <Layers className="h-3 w-3 text-slate-400 stroke-[2]" />
                                    <span>
                                        Item Belanja ({totalItemsCount} pcs)
                                    </span>
                                </div>

                                <div className="space-y-1.5 max-h-24 overflow-hidden">
                                    {tx.transactionItems
                                        .slice(0, 2)
                                        .map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-300 gap-4 bg-white/50 dark:bg-black/10 px-2.5 py-1.5 rounded-xl border border-slate-100/60 dark:border-slate-800/40 shadow-xs"
                                            >
                                                <span className="truncate font-medium flex-1">
                                                    {item.productName}
                                                    {item.productMerk && (
                                                        <span className="text-[10px] text-slate-400 font-normal ml-1.5 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                                                            {item.productMerk}
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="font-semibold text-slate-700 dark:text-slate-200 shrink-0 text-[11px] font-mono bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded-md">
                                                    {item.quantity}x
                                                </span>
                                            </div>
                                        ))}

                                    {/* Indikator jika produk lebih dari 2 */}
                                    {tx.transactionItems.length > 2 && (
                                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold italic pt-0.5 pl-1.5 flex items-center gap-0.5">
                                            <span>
                                                +
                                                {tx.transactionItems.length - 2}{" "}
                                                produk lainnya...
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ─── Bagian Bawah: Nominal & Footer Metadata ─── */}
                        <div className="bg-slate-50/80 dark:bg-slate-900/40 px-4 py-3.5 border-t border-slate-100 dark:border-slate-800/60 flex flex-col gap-2.5">
                            <div className="flex justify-between items-baseline">
                                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                    Total Tagihan
                                </span>
                                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                                    Rp {formatCurrency(tx.totalAmount, "id-ID")}
                                </span>
                            </div>

                            {/* Footer Meta: Waktu Transaksi & Indikator Cicilan/Tenor */}
                            <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3 text-slate-400" />
                                    <span>
                                        {formatDate(
                                            tx.createdAt,
                                            formatters.date,
                                        )}
                                    </span>
                                </div>

                                {tx.isInstallment ? (
                                    <Badge
                                        variant="secondary"
                                        className="text-[9px] px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-none font-bold rounded-md flex items-center gap-1"
                                    >
                                        <CalendarRange className="h-2.5 w-2.5 text-amber-500 stroke-[2.5]" />
                                        Cicilan:{" "}
                                        {formatDate(
                                            tx.dueDate,
                                            formatters.date,
                                        )}
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="secondary"
                                        className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-none font-bold rounded-md flex items-center gap-1"
                                    >
                                        <Wallet className="h-2.5 w-2.5 text-emerald-500 stroke-[2.5]" />
                                        Tunai
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
