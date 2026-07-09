"use client";

import {
    ArrowLeft,
    Edit3,
    Trash2,
    Layers,
    CheckCircle,
    XCircle,
    ExternalLink,
    Calendar,
    Archive,
    Image,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useProduct } from "../hooks/use-product";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { useProductMutations } from "../hooks/use-product-mutations";
import { formatDate, formatIDR, formatters, getErrorMessage } from "@/utils";
import { Suspense } from "react";
import { ToastTrigger } from "@/components/shared/ToastTrigger";

interface Props {
    productId: string;
    storeSlug: string;
}

export default function ProductDetail({ productId, storeSlug }: Props) {
    const { data: product, isLoading } = useProduct(productId, storeSlug);
    const { deleteProduct, isDeleting } = useProductMutations(storeSlug);
    async function handleDelete(id: string) {
        try {
            await deleteProduct(id);
        } catch (err) {
            console.log("Error delete : ", getErrorMessage(err));
        }
    }
    if (isLoading || !product) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="aspect-video w-full" />
                </CardContent>
            </Card>
        );
    }
    return (
        <main>
            <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50/50 min-h-screen text-slate-900">
                {/* Header Top Bar Panel Admin */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                            <Button
                                asChild
                                variant="link"
                                className="p-0 h-auto text-slate-500 hover:text-slate-900 flex items-center gap-1"
                            >
                                <Link href={`/stores/${storeSlug}/products`}>
                                    <ArrowLeft className="w-3.5 h-3.5" /> Daftar
                                    Produk
                                </Link>
                            </Button>
                            <span>/</span>
                            <span className="text-slate-800 font-medium">
                                Detail Ringkas
                            </span>
                        </div>
                    </div>

                    {/* Tombol Aksi Utama Admin */}
                    <div className="flex items-center gap-2">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1.5 border-slate-200"
                        >
                            <Link
                                href={`/stores/${storeSlug}/products/${product.id}/edit`}
                            >
                                <Edit3 className="w-4 h-4" /> Edit Produk
                            </Link>
                        </Button>

                        <DeleteConfirmDialog
                            isDeleting={isDeleting}
                            onConfirm={() => handleDelete(product.id)}
                            triggerButton={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-200"
                                >
                                    <Trash2 className="w-4 h-4" /> Hapus
                                </Button>
                            }
                            title="Apakah anda yakin menghapus produk ini?"
                            description="Semua varian produk akan ikut terhapus"
                        />
                    </div>
                </div>

                {/* Grid Utama Informasi */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Kolom Kiri & Tengah: Data Teknis & Varian */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Card 1: Informasi Dasar & System ID */}
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="bg-slate-50/50 px-6">
                                <CardTitle className="text-base ">
                                    <div className="flex justify-between">
                                        <div className="font-semibold">
                                            Informasi Dasar Produk
                                        </div>
                                        <div className="italic text-sm text-muted-foreground">
                                            Dibuat :{" "}
                                            {formatDate(
                                                product.createdAt,
                                                formatters.longDateTime,
                                            )}
                                        </div>
                                    </div>
                                </CardTitle>
                                <CardDescription>
                                    <Badge
                                        variant={
                                            product.isActive
                                                ? "outline"
                                                : "destructive"
                                        }
                                        className={
                                            product.isActive
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : ""
                                        }
                                    >
                                        {product.isActive ? (
                                            <span className="flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />{" "}
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <XCircle className="w-3 h-3" />{" "}
                                                Nonaktif
                                            </span>
                                        )}
                                    </Badge>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                {/* Baris 1: Nama & Merk (Lebih penting untuk Admin daripada ID) */}
                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
                                        Nama Produk
                                    </span>
                                    <p className="font-semibold text-base text-slate-800">
                                        {product.name}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
                                        Merk / Manufaktur
                                    </span>
                                    <p className="font-semibold text-base text-slate-800">
                                        {product.merk}
                                    </p>
                                </div>

                                <div className="space-y-1 pt-2">
                                    <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
                                        Kategori
                                    </span>
                                    <p className="font-semibold text-base text-slate-800">
                                        {product.category?.name}
                                    </p>
                                    {/* Catatan: Di real application, ID kategori (categoryId) di-resolve di backend/fetch menjadi nama kategori asli */}
                                </div>

                                {/* Status Konfigurasi Varian yang Diperbaiki kodenya */}
                                <div className="space-y-1 pt-2">
                                    <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
                                        Tipe Produk
                                    </span>
                                    <p className="text-slate-700 flex items-center gap-1.5 font-medium">
                                        <Layers className="w-4 h-4 text-slate-400" />
                                        {product.variants &&
                                        product.variants.length > 1 ? (
                                            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs font-semibold">
                                                Multi-Varian (
                                                {product.variants.length}{" "}
                                                Ukuran)
                                            </span>
                                        ) : (
                                            <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold">
                                                Produk Tunggal
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {/* Deskripsi */}
                                <div className="md:col-span-2 pt-2">
                                    <Separator className="my-2" />
                                    <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider mb-2">
                                        Deskripsi Produk
                                    </span>
                                    {product.description ? (
                                        <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded border">
                                            {product.description}
                                        </p>
                                    ) : (
                                        <p className="text-xs italic text-slate-400 bg-slate-50/50 p-3 rounded border border-dashed">
                                            Belum ada deskripsi retail yang
                                            ditambahkan untuk produk ini.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 2: Tabel Manajemen Inventaris & Harga (Variants) */}
                        <Card className="shadow-sm border-slate-200 overflow-hidden">
                            <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-base font-semibold">
                                        Stok & Varian Produk
                                    </CardTitle>
                                    <CardDescription>
                                        Manajemen SKU, ukuran/tipe, dan
                                        kalkulasi harga inventaris.
                                    </CardDescription>
                                </div>
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-mono text-xs">
                                    {product.variants.length} Item Tersedia
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-100/70">
                                        <TableRow>
                                            <TableHead className="font-semibold text-xs text-slate-600 pl-6">
                                                SKU Varian
                                            </TableHead>
                                            <TableHead className="font-semibold text-xs text-slate-600">
                                                Ukuran
                                            </TableHead>
                                            <TableHead className="font-semibold text-xs text-slate-600">
                                                Warna
                                            </TableHead>
                                            <TableHead className="font-semibold text-xs text-slate-600 ">
                                                Stok
                                            </TableHead>
                                            <TableHead className="font-semibold text-xs text-slate-600 text-right pr-6">
                                                Harga (IDR)
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {product.variants.map((v) => (
                                            <TableRow
                                                key={v.id}
                                                className="hover:bg-slate-50/80 transition-colors"
                                            >
                                                <TableCell className="font-mono text-xs font-medium text-slate-700 pl-6">
                                                    {v.sku}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-semibold text-sm">
                                                        {v.attributes.size ||
                                                            "Default Size"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {v.attributes.size && (
                                                        <span className="text-xs text-slate-400">
                                                            {v.attributes.color}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-900">
                                                    <span
                                                        className={`inline-block font-semibold rounded-md text-xs px-2 py-1 ${
                                                            parseFloat(
                                                                v.stock,
                                                            ) <= 10
                                                                ? "bg-amber-50 text-amber-700 font-medium"
                                                                : "bg-slate-100 text-slate-800"
                                                        }`}
                                                    >
                                                        {Math.floor(
                                                            parseFloat(v.stock),
                                                        )}{" "}
                                                        {v.unit}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    {formatIDR(Number(v.price))}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Kolom Kanan: Media/Asset & Log */}
                    <div className="space-y-6">
                        {/* Card 3: Validasi Aset Gambar */}
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="bg-slate-50/50">
                                <CardTitle className="text-base font-semibold">
                                    Media & Gambar Produk
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                <div className="border border-slate-200 bg-slate-100 rounded-lg aspect-square relative overflow-hidden flex items-center justify-center group">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl ?? undefined}
                                            alt={product.name}
                                            className="max-w-full max-h-full object-contain"
                                            onError={(e) => {
                                                // Fallback visual jika CDN lokal bermasalah
                                                e.currentTarget.style.display =
                                                    "none";
                                                if (
                                                    e.currentTarget
                                                        .parentElement
                                                ) {
                                                    e.currentTarget.parentElement.innerHTML = `
                        <div class="text-center p-4">
                          <p class="text-xs font-mono text-slate-400 break-all mb-2">${product.imageUrl}</p>
                          <span class="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded border border-amber-200 inline-block">Local Asset URL</span>
                        </div>
                      `;
                                                }
                                            }}
                                        />
                                    ) : (
                                        <Image className="h-full w-full object-cover cursor-pointer scale-100 object-center transition-transform duration-500 group-hover:scale-102">
                                            {" "}
                                        </Image>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-slate-500">
                                        Storage Object URL
                                    </span>
                                    <a
                                        href={product.imageUrl ?? undefined}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 break-all font-mono"
                                    >
                                        Buka Link Storage{" "}
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="col-span-12 mt-6 p-4 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 font-mono text-xs shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                        <span className="font-bold text-amber-400">
                            🛠️ DEBUGGER: useCartStore Local State
                        </span>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                            Total Jenis Item
                        </span>
                    </div>
                    <pre className="overflow-x-auto max-h-60 overflow-y-auto scrollbar-thin">
                        {JSON.stringify(product, null, 2)}
                    </pre>
                </div>
            </div>
        </main>
    );
}
