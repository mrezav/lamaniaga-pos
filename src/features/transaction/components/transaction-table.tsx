import { TransactionWithItems } from "../repositories/find-many";
import {
    Search,
    MoreVertical,
    ArrowUpRight,
    CheckCircle2,
    Receipt,
    Wallet,
    CalendarRange,
    HelpCircle,
    AlertCircle,
    Calendar,
    Clock3,
    ClockAlert,
    ChartPie,
    SlidersHorizontal,
    CalendarDays,
    ArrowDownWideNarrowIcon,
    Wallet2,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, formatters } from "@/utils";
import { TransactionItems } from "./transaction-item";
import { PaymentStatus } from "@/db/schema";

interface Props {
    transactions: TransactionWithItems[];
}
export function TransactionTable({ transactions }: Props) {
    return (
        <div className="rounded-md bg-card min-h-10 flex flex-col justify-between">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/90">
                        <TableRow>
                            <TableHead className="w-[260px]">
                                Invoice & Sumber
                            </TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Produk</TableHead>
                            <TableHead>Tipe</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                                Nominal
                            </TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((tx) => (
                            <TableRow
                                key={tx.invoiceNumber}
                                className="group transition-colors hover:bg-muted/30"
                            >
                                {/* Invoice ID (Human Friendly, Date-based) */}
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                            <Receipt className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight truncate">
                                                {tx.invoiceNumber}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground mt-0.5">
                                                Kasir: {tx.cashierName}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Tanggal */}
                                <TableCell className="py-2">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="size-3.5 text-muted-foreground" />
                                            <span className="text-sm font-medium">
                                                {formatDate(
                                                    tx.createdAt,
                                                    formatters.date,
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Clock3 className="size-3.5 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(
                                                    tx.createdAt,
                                                    formatters.time,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Deskripsi Produk */}
                                <TableCell className="font-medium text-sm max-w-[200px] truncate text-slate-800 dark:text-slate-200">
                                    <TransactionItems
                                        items={tx.transactionItems}
                                    ></TransactionItems>
                                </TableCell>

                                {/* Tipe Transaksi (Tunai / Cicilan) */}
                                <TableCell>
                                    {!tx.isInstallment ? (
                                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-500/5 border-emerald-500/20  px-2 py-0.5 rounded-md">
                                            <Wallet className="h-3 w-3 text-emerald-500" />{" "}
                                            Kontan
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-xs text-yellow-600 font-medium bg-yellow-500/5 border-yellow-500/20 px-2 py-0.5 rounded-md">
                                            <CalendarRange className="h-3 w-3 text-yellow-500" />{" "}
                                            Cicilan
                                        </span>
                                    )}
                                </TableCell>

                                {/* Status Pembayaran (Paid, Unpaid, Partial) */}
                                <TableCell>
                                    {tx.paymentStatus ===
                                        PaymentStatus.PAID && (
                                        <Badge
                                            variant="outline"
                                            className="bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1.5 font-medium px-2.5 py-0.5 rounded-full text-[11px]"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />{" "}
                                            Lunas
                                        </Badge>
                                    )}
                                    {tx.paymentStatus ===
                                        PaymentStatus.PARTIAL && (
                                        <Badge
                                            variant="outline"
                                            className="bg-sky-500/5 text-sky-600 dark:text-sky-400 border-sky-500/20 gap-1.5 font-medium px-2.5 py-0.5 rounded-full text-[11px]"
                                        >
                                            <ChartPie className="h-3.5 w-3.5 stroke-[2.5]" />{" "}
                                            Dibayar Sebagian
                                        </Badge>
                                    )}
                                    {tx.paymentStatus ===
                                        PaymentStatus.UNPAID && (
                                        <Badge
                                            variant="outline"
                                            className="bg-yellow-500/5 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 gap-1.5 font-medium px-2.5 py-0.5 rounded-full text-[11px]"
                                        >
                                            <HelpCircle className="h-3.5 w-3.5 stroke-[2.5]" />{" "}
                                            Belum Dibayar
                                        </Badge>
                                    )}
                                    {tx.paymentStatus ===
                                        PaymentStatus.FAILED && (
                                        <Badge
                                            variant="outline"
                                            className="bg-destructive/5 text-destructive border-destructive/20 gap-1.5 font-medium px-2.5 py-0.5 rounded-full text-[11px]"
                                        >
                                            <AlertCircle className="h-3.5 w-3.5 stroke-[2.5]" />{" "}
                                            Dibatalkan
                                        </Badge>
                                    )}
                                    {tx.paymentStatus ===
                                        PaymentStatus.OVERDUE && (
                                        <Badge
                                            variant="outline"
                                            className="bg-destructive/5 text-destructive border-destructive/20 gap-1.5 font-medium px-2.5 py-0.5 rounded-full text-[11px]"
                                        >
                                            <ClockAlert className="h-3.5 w-3.5 stroke-[2.5]" />{" "}
                                            Jatuh Tempo
                                        </Badge>
                                    )}
                                </TableCell>

                                {/* Nominal */}
                                <TableCell className="font-semibold text-right text-sm text-slate-900 dark:text-slate-50">
                                    <span className="text-lg font-bold text-emerald-500">
                                        Rp{" "}
                                        {Number(tx.totalAmount).toLocaleString(
                                            "id-ID",
                                        )}
                                    </span>
                                </TableCell>

                                {/* Actions Menu */}
                                <TableCell className="text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100"
                                            >
                                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-44 rounded-xl"
                                        >
                                            <DropdownMenuLabel>
                                                Aksi Invoice
                                            </DropdownMenuLabel>
                                            <DropdownMenuItem className="cursor-pointer gap-2 text-xs">
                                                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />{" "}
                                                Lihat Detail Kasir
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer text-xs">
                                                Cetak Struk (PDF)
                                            </DropdownMenuItem>
                                            {tx.paymentStatus === "partial" && (
                                                <DropdownMenuItem className="cursor-pointer text-xs text-indigo-600 font-medium">
                                                    Bayar Cicilan Next
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
