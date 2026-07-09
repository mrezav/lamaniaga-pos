import { db } from "@/db";
import { eq } from "drizzle-orm";
import { profiles } from "@/db/schema";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStoreBySlug } from "@/lib/store";
import { findStoreMember } from "@/features/store/repositories";
import { StoreLayoutClient } from "@/features/store/components";

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ storeSlug: string }>;
}) {
    const { storeSlug } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Data sudah pasti ada karena divalidasi di root layout,
    // tapi kita ambil lagi untuk dioper ke StoreLayoutClient
    const store = await getStoreBySlug(storeSlug);
    if (!store || !user) return notFound();

    const userProfile = await db.query.profiles.findFirst({
        where: eq(profiles.id, user.id),
    });

    const storeMember = await findStoreMember(store.id, user.id);

    if (!userProfile || !storeMember) return notFound();

    return (
        <StoreLayoutClient
            store={store}
            profile={userProfile}
            storeMember={storeMember}
        >
            {children}
        </StoreLayoutClient>
    );
}
