import {
    pgTable,
    foreignKey,
    pgPolicy,
    uuid,
    text,
    timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { stores } from "./stores";

export const profiles = pgTable(
    "profiles",
    {
        id: uuid("id").primaryKey().notNull(),
        fullName: text("full_name").notNull(),
        avatarUrl: text("avatar_url"),
        phoneNumber: text("phone_number"),
        lastActiveStoreId: uuid("last_active_store_id"),
        updatedAt: timestamp("updated_at", {
            withTimezone: true,
            mode: "string",
        })
            .defaultNow()
            .$onUpdate(() => sql`now()`),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "string",
        }).defaultNow(),
        deletedAt: timestamp("deleted_at", {
            withTimezone: true,
            mode: "string",
        }).defaultNow(),
    },
    (table) => [
        foreignKey({
            columns: [table.id],
            foreignColumns: [users.id],
            name: "profiles_id_fkey",
        }).onDelete("cascade"),
        foreignKey({
            columns: [table.lastActiveStoreId],
            foreignColumns: [stores.id],
            name: "profiles_last_active_store_id_fkey",
        }).onDelete("set null"),
        pgPolicy("Profiles are viewable by everyone", {
            as: "permissive",
            for: "select",
            to: ["public"],
            using: sql`true`, // Aman untuk SELECT jika tidak ada data rahasia di tabel profiles
        }),
        pgPolicy("Users can manage own profile", {
            as: "permissive",
            for: "all", // Mengcover SELECT, INSERT, UPDATE, DELETE sekaligus
            to: ["authenticated"],
            using: sql`(auth.uid() = id)`,
            withCheck: sql`(auth.uid() = id)`,
        }),
    ],
);

export type ProfileRow = typeof profiles.$inferSelect;
