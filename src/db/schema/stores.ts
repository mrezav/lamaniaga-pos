import {
    pgTable,
    foreignKey,
    pgPolicy,
    uuid,
    text,
    timestamp,
    boolean,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const stores = pgTable(
    "stores",
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        name: text("name").notNull(),
        slug: text("slug").unique().notNull(),
        address: text("address"),
        phoneNumber: text("phone_number"),
        logoUrl: text("logo_url"),
        bannerUrl: text("banner_url"),
        ownerId: uuid("owner_id").notNull(),
        joinCode: text("join_code").unique(),
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "string",
        }).defaultNow(),
    },
    (table) => [
        foreignKey({
            columns: [table.ownerId],
            foreignColumns: [users.id],
            name: "stores_owner_id_fkey",
        }),

        pgPolicy("Manage own store", {
            as: "permissive",
            for: "all",
            to: ["public"],
            using: sql`(auth.uid() = owner_id)`,
            withCheck: sql`(auth.uid() = owner_id)`,
        }),
        index("stores_owner_id_idx").on(table.ownerId),
        index("stores_name_idx").on(table.name),
        uniqueIndex("stores_slug_unique").on(table.slug),
    ],
);
