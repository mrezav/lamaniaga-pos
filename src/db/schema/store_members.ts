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

// membuat sebuah object const
export const MemberStatus = {
    IDLE: "idle",
    ACTIVE: "active",
    PENDING: "pending",
    REJECTED: "rejected",
} as const;

// membuat array of status dari object diatas untuk keperluan enum drizzle
export const MemberStatusValues = [
    MemberStatus.IDLE,
    MemberStatus.ACTIVE,
    MemberStatus.PENDING,
    MemberStatus.REJECTED,
] as const;

// membuat sebuah type dengan value berdasarkan status yang terdaftar diatas
export type MemberStatus = (typeof MemberStatusValues)[number];

export const MemberRole = {
    OWNER: "owner",
    MANAGER: "manager",
    CASHIER: "cashier",
};
export const MemberRoleValues = [
    MemberRole.OWNER,
    MemberRole.MANAGER,
    MemberRole.CASHIER,
] as const;
export type MemberRole = (typeof MemberRoleValues)[number];

export const storeMembers = pgTable(
    "store_members",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        userId: uuid("user_id").notNull(),
        storeId: uuid("store_id").notNull(),
        role: text("role", { enum: MemberRoleValues })
            .default("cashier")
            .notNull(),
        status: text("status", {
            enum: MemberStatusValues,
        })
            .default("active")
            .notNull(),
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
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: "store_members_user_id_fkey",
        }).onDelete("cascade"),
        foreignKey({
            columns: [table.storeId],
            foreignColumns: [stores.id],
            name: "store_members_store_id_fkey",
        }).onDelete("cascade"),

        // RLS Policies
        pgPolicy("Users can view own memberships", {
            as: "permissive",
            for: "select",
            to: ["public"],
            using: sql`(auth.uid() = user_id)`,
        }),
        // ✅ REFACTOR RLS: Hanya user dengan role 'owner' di toko tersebut yang bisa mengutak-atik anggota team
        pgPolicy("Owners can insert store members", {
            as: "permissive",
            for: "insert",
            to: ["public"],
            withCheck: sql`exists (
                select 1 from store_members 
                where store_members.store_id = store_id 
                and store_members.user_id = auth.uid() 
                and store_members.role = 'owner'
            )`,
        }),
        pgPolicy("Owners can update store members", {
            as: "permissive",
            for: "update",
            to: ["public"],
            using: sql`exists (
                select 1 from store_members 
                where store_members.store_id = store_id 
                and store_members.user_id = auth.uid() 
                and store_members.role = 'owner'
            )`,
        }),
        pgPolicy("Owners can delete store members", {
            as: "permissive",
            for: "delete",
            to: ["public"],
            using: sql`exists (
                select 1 from store_members 
                where store_members.store_id = store_id 
                and store_members.user_id = auth.uid() 
                and store_members.role = 'owner'
            )`,
        }),
    ],
);

export type StoreMemberRow = typeof storeMembers.$inferSelect;
