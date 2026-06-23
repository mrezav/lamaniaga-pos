import { db } from "@/db";
import { profiles, storeMembers, stores } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function findUserStores(userId: string) {
    return db
        .select({
            store: stores,
            member: {
                role: storeMembers.role,
                status: storeMembers.status,
            },
        })
        .from(stores)
        .innerJoin(storeMembers, eq(storeMembers.storeId, stores.id))
        .where(
            and(
                eq(storeMembers.userId, userId),
                eq(storeMembers.status, "active"),
            ),
        );
}

// membuat tipe data baru sesuai dengan output findUserStores
export type UserStoreList = Awaited<ReturnType<typeof findUserStores>>;

export async function findStoreMembers(storeId: string) {
    return await db
        .select({
            id: storeMembers.id,
            userId: storeMembers.userId,
            role: storeMembers.role,
            status: storeMembers.status,
            createdAt: storeMembers.createdAt,
            fullName: profiles.fullName,
            avatarUrl: profiles.avatarUrl,
        })
        .from(storeMembers)
        .innerJoin(profiles, eq(storeMembers.userId, profiles.id))
        .where(eq(storeMembers.storeId, storeId))
        .orderBy(storeMembers.createdAt);
}
