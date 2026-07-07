import Link from "next/link";
import { useProducts } from "@/features/product/hooks/use-products";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    SearchAlert,
} from "lucide-react";
import { redirect } from "next/navigation";
import { useProductMutations } from "../hooks/use-product-mutations";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ProductListItem } from "../types";
import { formatCurrency, formatDate, formatIDR, formatters } from "@/utils";
interface Props {
    items: ProductListItem[];
    numberList: (index: number) => number;
    handleEdit: (id: string) => void;
    handleDelete: (id: string) => void;
    isDeleting: boolean;
}
export default function ProductTable({
    items,
    numberList,
    handleEdit,
    handleDelete,
    isDeleting,
}: Props) {
    return (
        <div className="rounded-md bg-card min-h-10 flex flex-col justify-between">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center">#</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Merk</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Dibuat</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <div className="grid justify-items-center items-center text-center gap-2">
                                        <SearchAlert />
                                        <p>Produk tidak ditemukan</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((product, index) => (
                                <TableRow key={product.id}>
                                    <TableCell className="text-center">
                                        {numberList(index)}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {product.name}
                                    </TableCell>
                                    <TableCell>{product.merk}</TableCell>
                                    <TableCell>
                                        {product.categoryName}
                                    </TableCell>
                                    <TableCell>
                                        {product.isActive
                                            ? "Aktif"
                                            : "Nonaktif"}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(
                                            product.createdAt,
                                            formatters.date,
                                        )}
                                    </TableCell>
                                    <TableCell className="text-md font-bold text-emerald-500">
                                        {(() => {
                                            // 1. Ambil semua harga dari varian ke dalam satu array
                                            const prices = product.variants.map(
                                                (v) => Number(v.price),
                                            );

                                            // 2. Proteksi jika produk ternyata tidak memiliki varian agar tidak error
                                            if (prices.length === 0)
                                                return "Rp 0";

                                            const minPrice = Math.min(
                                                ...prices,
                                            );
                                            const maxPrice = Math.max(
                                                ...prices,
                                            );

                                            // 4. Jika harga min dan max sama, tampilkan satu harga saja. Jika beda, tampilkan range.
                                            return minPrice === maxPrice
                                                ? formatIDR(minPrice)
                                                : `${formatIDR(minPrice)} ~ ${formatIDR(maxPrice)}`;
                                        })()}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            className="rounded-lg bg-amber-400 hover:bg-amber-500 hover:cursor-pointer text-white"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleEdit(product.id)
                                            }
                                        >
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Ubah
                                        </Button>
                                        <DeleteConfirmDialog
                                            isDeleting={isDeleting}
                                            onConfirm={() =>
                                                handleDelete(product.id)
                                            }
                                            triggerButton={
                                                <Button
                                                    className="rounded-lg bg-pink-600 hover:bg-pink-700 hover:cursor-pointer text-white"
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Hapus
                                                </Button>
                                            }
                                            title="Apakah anda yakin menghapus produk ini?"
                                            description="Semua varian produk akan ikut terhapus"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
