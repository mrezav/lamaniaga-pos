import { pgTable, foreignKey, unique, pgPolicy, uuid, text, timestamp, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { stores } from "./stores";

export const categories = pgTable("categories", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    description: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    storeId: uuid("store_id"),
}, (table) => [
    foreignKey({
        columns: [table.storeId],
        foreignColumns: [stores.id],
        name: "categories_store_id_fkey"
    }).onDelete("cascade"),
    unique("categories_slug_key").on(table.slug),
    index("categories_store_id_idx").on(table.storeId),
    pgPolicy("Manage own categories", {
        as: "permissive", for: "all", to: ["public"], using: sql`store_id IN (SELECT owned_store_ids())`
    }),
]);
