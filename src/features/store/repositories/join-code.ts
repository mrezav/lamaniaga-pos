import { db } from "@/db";
import { storeMembers, stores } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function setJoinCode(storeId: string, code: string) {
    return db
        .update(stores)
        .set({ joinCode: code })
        .where(eq(stores.id, storeId));
}

export async function applyCode(userId: string, storeId: string) {
    return db.insert(storeMembers).values({
        userId,
        storeId: storeId,
        role: "cashier",
        status: "pending",
    });
}

export async function reApplyCode(id: string) {
    return db
        .update(storeMembers)
        .set({ status: "pending", updatedAt: new Date().toISOString() })
        .where(eq(storeMembers.id, id));
}
