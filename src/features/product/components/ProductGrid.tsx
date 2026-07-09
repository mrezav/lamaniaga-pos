import { ProductListItem } from "../types";
import { ProductCard } from "./ProductCard";
import EmptySection from "@/components/shared/EmptySection";

interface Props {
    items: ProductListItem[];
    handleDetail: (id: string) => void;
    handleEdit: (id: string) => void;
    handleDelete: (id: string) => void;
    isDeleting: boolean;
}
export default function ProductGrid({
    items,
    handleDetail,
    handleEdit,
    handleDelete,
    isDeleting,
}: Props) {
    if (items.length < 1) {
        return <EmptySection></EmptySection>;
    }
    return (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-6">
            {items.map((item) => (
                <ProductCard
                    key={item.id}
                    item={item}
                    handleDetail={handleDetail}
                    handleDelete={handleDelete}
                    handleEdit={handleEdit}
                    isDeleting={isDeleting}
                ></ProductCard>
            ))}
        </div>
    );
}
