import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function findUserProfile(userId: string) {
    return db.query.profiles.findFirst({
        where: eq(profiles.id, userId),
    });
}
