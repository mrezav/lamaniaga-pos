import {
    pgTable,
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
        joinCode: text("join_code").unique(),
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "string",
        }).defaultNow(),
        updatedAt: timestamp("updated_at", {
            withTimezone: true,
            mode: "string",
        })
            .defaultNow()
            .$onUpdate(() => sql`now()`),
        deletedAt: timestamp("deleted_at", {
            withTimezone: true,
            mode: "string",
        }).defaultNow(),
        modifiedBy: uuid("modified_by").references(() => users.id, {
            onDelete: "set null",
        }),
    },
    (table) => [
        // ✅ REFACTOR RLS: Mengizinkan akses jika user terdaftar sebagai 'owner' atau 'manager' di store_members
        pgPolicy("Manage own store", {
            as: "permissive",
            for: "all",
            to: ["public"],
            using: sql`exists (
                select 1 from store_members 
                where store_members.store_id = id 
                and store_members.user_id = auth.uid() 
                and store_members.role IN ('owner', 'manager')
            )`,
            withCheck: sql`exists (
                select 1 from store_members 
                where store_members.store_id = id 
                and store_members.user_id = auth.uid() 
                and store_members.role IN ('owner', 'manager')
            )`,
        }),
        index("stores_name_idx").on(table.name),
        uniqueIndex("stores_slug_uniqe_idx").on(table.slug),
    ],
);

export type StoreRow = typeof stores.$inferSelect;
