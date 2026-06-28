import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles, storeMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { StoreLayoutClient } from "@/features/store/components";
import { getStoreBySlug } from "@/lib/store";
import { findStoreMember } from "@/features/store/repositories";
import { headers } from "next/headers";

interface StoreLayoutProps {
    children: React.ReactNode;
    params: Promise<{ storeSlug: string }>;
}

export default async function StoreLayout({
    children,
    params,
}: StoreLayoutProps) {
    const { storeSlug } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get user profile
    const userProfile = await db.query.profiles.findFirst({
        where: eq(profiles.id, user.id),
    });

    if (!userProfile) {
        redirect("/stores");
    }

    // Fetch the current store by slug
    const store = await getStoreBySlug(storeSlug);

    if (!store) {
        redirect("/stores");
    }

    // Query store membership record
    const memberRecord = await db.query.storeMembers.findFirst({
        where: and(
            eq(storeMembers.storeId, store.id),
            eq(storeMembers.userId, user.id),
            eq(storeMembers.status, "active"),
        ),
    });

    if (!memberRecord) {
        redirect("/stores");
    }

    // Self-Healing Sync: Ensure active profile lastActiveStoreId matches the current tenant slug URL
    if (userProfile.lastActiveStoreId !== store.id) {
        await db
            .update(profiles)
            .set({ lastActiveStoreId: store.id })
            .where(eq(profiles.id, user.id));
        userProfile.lastActiveStoreId = store.id;
    }

    const storeMember = await findStoreMember(store.id, user.id);
    if (!storeMember) {
        redirect("/stores");
    }

    // 1. Ambil data headers untuk mendeteksi URL aktif saat ini
    const headersList = await headers();
    const fullPath = headersList.get("x-current-path") || "";

    console.log(fullPath);

    // 2. Cek apakah pengguna sedang mengakses halaman checkout kasir
    // Kondisi ini mencakup '[storeSlug]/checkout' dan sub-path di bawahnya jika ada
    const isCheckoutPage =
        fullPath.endsWith(`/stores/${storeSlug}/checkout`) ||
        fullPath.includes(`/stores/${storeSlug}/checkout/`);

    // JIKA DI HALAMAN CHECKOUT: Bypass layout admin, render murni full-screen
    if (isCheckoutPage) {
        return (
            <div className="h-screen w-screen overflow-hidden bg-background">
                {children}
            </div>
        );
    }

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
