interface StoreLayoutProps {
    children: React.ReactNode;
    params: Promise<{ storeSlug: string }>;
}

export default async function StoreLayout({
    children,
    params,
}: StoreLayoutProps) {
    return <>{children}</>;
}
