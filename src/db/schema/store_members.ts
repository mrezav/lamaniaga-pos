import { pgTable, foreignKey, pgPolicy, uuid, text, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { users } from "./users"
import { stores } from "./stores"

export const storeMembers = pgTable("store_members", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  userId: uuid("user_id").notNull(),
  storeId: uuid("store_id").notNull(),
  role: text("role", { enum: ["owner", "manager", "cashier"] }).default("cashier").notNull(),
  status: text("status", { enum: ["idle", "pending", "active", "rejected"] }).default("active").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
    .defaultNow()
    .$onUpdate(() => sql`now()`),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "store_members_user_id_fkey"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.storeId],
    foreignColumns: [stores.id],
    name: "store_members_store_id_fkey"
  }).onDelete("cascade"),

  // RLS Policies
  pgPolicy("Users can view own memberships", {
    as: "permissive",
    for: "select",
    to: ["public"],
    using: sql`(auth.uid() = user_id)`
  }),
  pgPolicy("Owners can insert store members", {
    as: "permissive",
    for: "insert",
    to: ["public"],
    withCheck: sql`exists (
      select 1 from stores 
      where stores.id = store_id and stores.owner_id = auth.uid()
    )`
  }),
  pgPolicy("Owners can update store members", {
    as: "permissive",
    for: "update",
    to: ["public"],
    using: sql`exists (
      select 1 from stores 
      where stores.id = store_id and stores.owner_id = auth.uid()
    )`
  }),
  pgPolicy("Owners can delete store members", {
    as: "permissive",
    for: "delete",
    to: ["public"],
    using: sql`exists (
      select 1 from stores 
      where stores.id = store_id and stores.owner_id = auth.uid()
    )`
  }),
]);
