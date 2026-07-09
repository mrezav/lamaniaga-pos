import { Pagination } from "@/types";
import { Button } from "../ui/button";
import { SetStateAction } from "react";
interface PaginationSectionProps {
    pagination: Pagination;
    setPage: (value: SetStateAction<number>) => void;
    isLoading: boolean;
}
export default function PaginationSection({
    pagination,
    setPage,
    isLoading,
}: PaginationSectionProps) {
    return (
        <div className="flex items-center justify-between p-4 border-t bg-muted/20">
            <span className="text-xs text-muted-foreground">
                Total: {pagination.totalItems} Baris
            </span>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.page <= 1 || isLoading}
                >
                    Sebelumnya
                </Button>
                <span className="text-xs font-medium">
                    Halaman {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={
                        pagination.page >= pagination.totalPages || isLoading
                    }
                >
                    Berikutnya
                </Button>
            </div>
        </div>
    );
}
