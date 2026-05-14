import { pgTable, foreignKey, pgPolicy, uuid, text, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { users } from "./users";
import { stores } from "./stores";

export const profiles = pgTable("profiles", {
    id: uuid("id").primaryKey().notNull(),
    fullName: text("full_name").notNull(),
    avatarUrl: text("avatar_url"),
    phoneNumber: text("phone_number"),
    storeId: uuid("store_id"),
    role: text("role", { enum: ["owner", "manager", "cashier"] }).default("cashier"),
    status: text("status", { enum: ["idle", "pending", "active", "rejected"] }).default("idle"),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
        .defaultNow()
        .$onUpdate(() => sql`now()`),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
    foreignKey({
        columns: [table.id],
        foreignColumns: [users.id],
        name: "profiles_id_fkey"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.storeId],
        foreignColumns: [stores.id],
        name: "profiles_store_id_fkey"
    }).onDelete("set null"),
    pgPolicy("Users can view own profile", {
        as: "permissive",
        for: "select",
        to: ["public"],
        using: sql`(auth.uid() = id)`
    }),
    pgPolicy("Owners can view their staff", {
        as: "permissive",
        for: "select",
        to: ["public"],
        using: sql`exists (
            select 1 from stores 
            where stores.id = store_id and stores.owner_id = auth.uid()
        )`
    }),
]);
