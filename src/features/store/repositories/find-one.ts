import { db } from "@/db";
import { MemberStatus, storeMembers, stores } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function findStoreBySlug(slug: string) {
    return db.query.stores.findFirst({
        where: eq(stores.slug, slug),
    });
}

export async function findStoreByCode(code: string) {
    return db.query.stores.findFirst({
        where: eq(stores.joinCode, code),
    });
}

export async function checkExistingJoinCode(code: string) {
    return db.query.stores.findFirst({
        where: eq(stores.joinCode, code),
        columns: { id: true },
    });
}

export async function findStoreMember(
    storeId: string,
    userId: string,
    status?: MemberStatus,
) {
    const condition = [
        eq(storeMembers.userId, userId),
        eq(storeMembers.storeId, storeId),
    ];
    if (status) {
        condition.push(eq(storeMembers.status, status));
    }
    const member = await db.query.storeMembers.findFirst({
        where: and(...condition),
    });

    return member;
}
