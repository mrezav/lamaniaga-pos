import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles, stores, storeMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { StoreLayoutClient } from "@/features/stores/components";

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
    const store = await db.query.stores.findFirst({
        where: eq(stores.slug, storeSlug),
    });

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

    // Multi-Tenant Security Authorization Guard
    const isOwner = store.ownerId === user.id;
    const isStaff = !!memberRecord;
    const isAllowed = isOwner || isStaff;

    if (!isAllowed) {
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

    return (
        <StoreLayoutClient store={store} profile={userProfile}>
            {children}
        </StoreLayoutClient>
    );
}
