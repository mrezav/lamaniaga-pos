import { db } from "@/db";
import { MemberStatus, storeMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateMemberStatus(
    memberId: string,
    status: MemberStatus,
) {
    return db
        .update(storeMembers)
        .set({
            status: status,
        })
        .where(eq(storeMembers.id, memberId));
}
