export function TransactionItems({
    items,
}: {
    items: { id: string; productName: string }[];
}) {
    const visibleItems = items.slice(0, 2);
    const remaining = items.length - visibleItems.length;

    return (
        <div className="flex flex-col">
            {visibleItems.map((item) => (
                <span key={item.id} className="truncate">
                    {item.productName}
                </span>
            ))}

            {remaining > 0 && (
                <span className="text-xs text-muted-foreground">
                    +{remaining} produk lainnya
                </span>
            )}
        </div>
    );
}
