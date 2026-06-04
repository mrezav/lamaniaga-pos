import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getStoreBySlug(storeSlug: string) {
    const store = db.query.stores.findFirst({
        where: eq(stores.slug, storeSlug),
    });
    return store;
}
