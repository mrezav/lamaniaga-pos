import { db } from "@/db";
import { storeMembers } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getVerifiedMember(storeId: string, userId: string) {
    const member = await db.query.storeMembers.findFirst({
        where: and(
            eq(storeMembers.userId, userId),
            eq(storeMembers.storeId, storeId),
            eq(storeMembers.status, "active"),
        ),
    });
    return member;
}
