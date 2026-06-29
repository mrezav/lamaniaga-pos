import CashierClientView from "@/features/cashier/components/CashierClientView";

interface PageProps {
    params: Promise<{ storeSlug: string }>;
}

export default async function CashierCheckoutPage({ params }: PageProps) {
    const { storeSlug } = await params;

    return <CashierClientView storeSlug={storeSlug} />;
}
