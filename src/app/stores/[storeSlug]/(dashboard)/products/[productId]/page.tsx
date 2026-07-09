import ProductDetail from "@/features/product/components/ProductDetail";

interface ProductDetailPageProps {
    params: Promise<{ storeSlug: string; productId: string }>;
}

export default async function ProductDetailPage({
    params,
}: ProductDetailPageProps) {
    const { productId, storeSlug } = await params;

    return (
        <ProductDetail
            productId={productId}
            storeSlug={storeSlug}
        ></ProductDetail>
    );
}
