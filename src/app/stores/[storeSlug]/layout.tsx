import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles, storeMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getStoreBySlug } from "@/lib/store";
import { findStoreMember } from "@/features/store/repositories";

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
