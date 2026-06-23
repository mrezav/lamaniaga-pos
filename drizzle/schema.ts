import {
    pgTable,
    index,
    foreignKey,
    uuid,
    text,
    timestamp,
    unique,
    check,
    numeric,
    integer,
    jsonb,
    uniqueIndex,
    boolean,
    pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "@/db/schema/users";

export const categories = pgTable(
    "categories",
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        name: text().notNull(),
        slug: text().notNull(),
        description: text(),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "string",
        }).defaultNow(),
        storeId: uuid("store_id"),
        updatedAt: timestamp("updated_at", {
            withTimezone: true,
            mode: "string",
        }).defaultNow(),
        deletedAt: timestamp("deleted_at", { mode: "string" }),
        modifiedBy: uuid("modified_by"),
    },
    (table) => [
        index("categories_fts_idx").using(
            "gin",
            sql`to_tsvector('indonesian'::regconfig, name)`,
        ),
        index("categories_store_id_idx").using(
            "btree",
            table.storeId.asc().nullsLast().op("uuid_ops"),
        ),
        foreignKey({
            columns: [table.storeId],
            foreignColumns: [stores.id],
            name: "categories_store_id_fkey",
        }).onDelete("cascade"),
    ],
);

export const productVariants = pgTable(
    "product_variants",
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        productId: uuid("product_id"),
        sku: text(),
        price: numeric({ precision: 15, scale: 2 }).default("0").notNull(),
        stock: integer().default(0).notNull(),
        attributes: jsonb().default({}).notNull(),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "string",
        }).defaultNow(),
        storeId: uuid("store_id"),
        updatedAt: timestamp("updated_at", {
            withTimezone: true,
            mode: "string",
        }).defaultNow(),
        deletedAt: timestamp("deleted_at", { mode: "string" }),
        modifiedBy: uuid("modified_by"),
        imageUrl: text("image_url"),
        unit: text().default("pcs").notNull(),
    },
    (table) => [
        index("product_variants_product_id_idx").using(
            "btree",
            table.productId.asc().nullsLast().op("uuid_ops"),
        ),
        index("product_variants_store_id_idx").using(
            "btree",
            table.storeId.asc().nullsLast().op("uuid_ops"),
        ),
        foreignKey({
            columns: [table.modifiedBy],
            foreignColumns: [users.id],
            name: "product_variants_modified_by_users_id_fk",
        }).onDelete("set null"),
        foreignKey({
            columns: [table.productId],
            foreignColumns: [products.id],
            name: "product_variants_product_id_fkey",
        }).onDelete("cascade"),
        foreignKey({
            columns: [table.storeId],
            foreignColumns: [stores.id],
            name: "product_variants_store_id_fkey",
        }).onDelete("cascade"),
        unique("product_variants_sku_key").on(table.sku),
        check("product_variants_price_check", sql`price >= (0)::numeric`),
        check("product_variants_stock_check", sql`stock >= 0`),
    ],
);

export const products = pgTable(
    "products",
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        categoryId: uuid("category_id"),
        name: text().notNull(),
        slug: text().notNull(),
        description: text(),
        imageUrl: text("image_url"),
        isActive: boolean("is_active").default(true),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "string",
        }).defaultNow(),
        storeId: uuid("store_id"),
        updatedAt: timestamp("updated_at", {
            withTimezone: true,
            mode: "string",
        }).defaultNow(),
        deletedAt: timestamp("deleted_at", { mode: "string" }),
        modifiedBy: uuid("modified_by"),
        merk: text().notNull(),
    },
    (table) => [
        index("products_category_id_idx").using(
            "btree",
            table.categoryId.asc().nullsLast().op("uuid_ops"),
        ),
        index("products_fts_idx").using(
            "gin",
            sql`to_tsvector('indonesian'::regconfig, ((name || ' '::text) || CO`,
        ),
        index("products_store_id_idx").using(
            "btree",
            table.storeId.asc().nullsLast().op("uuid_ops"),
        ),
        uniqueIndex("products_store_slug_partial_idx")
            .using(
                "btree",
                table.storeId.asc().nullsLast().op("text_ops"),
                table.slug.asc().nullsLast().op("text_ops"),
            )
            .where(sql`(deleted_at IS NULL)`),
        foreignKey({
            columns: [table.categoryId],
            foreignColumns: [categories.id],
            name: "products_category_id_fkey",
        }).onDelete("set null"),
        foreignKey({
            columns: [table.modifiedBy],
            foreignColumns: [users.id],
            name: "products_modified_by_users_id_fk",
        }).onDelete("set null"),
        foreignKey({
            columns: [table.storeId],
            foreignColumns: [stores.id],
            name: "products_store_id_fkey",
        }).onDelete("cascade"),
    ],
);

export const profiles = pgTable(
    "profiles",
    {
        id: uuid().primaryKey().notNull(),
        fullName: text("full_name").notNull(),
        avatarUrl: text("avatar_url"),
        phoneNumber: text("phone_number"),
        lastActiveStoreId: uuid("last_active_store_id"),
        updatedAt: timestamp("updated_at", {
            withTimezone: true,
            mode: "string",
        }).defaultNow(),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "string",
        }).defaultNow(),
    },
    (table) => [
        foreignKey({
            columns: [table.lastActiveStoreId],
            foreignColumns: [stores.id],
            name: "profiles_last_active_store_id_fkey",
        }).onDelete("set null"),
        pgPolicy("Users can view own profile", {
            as: "permissive",
            for: "select",
            to: ["public"],
        }),
    ],
);

export const storeMembers = pgTable(
    "store_members",
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        userId: uuid("user_id").notNull(),
        storeId: uuid("store_id").notNull(),
        role: text().default("cashier").notNull(),
        status: text().default("active").notNull(),
        updatedAt: timestamp("updated_at", {
            withTimezone: true,
            mode: "string",
        }).defaultNow(),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "string",
        }).defaultNow(),
    },
    (table) => [
        foreignKey({
            columns: [table.storeId],
            foreignColumns: [stores.id],
            name: "store_members_store_id_fkey",
        }).onDelete("cascade"),
        pgPolicy("Owners can manage their store members", {
            as: "permissive",
            for: "all",
            to: ["public"],
        }),
        pgPolicy("Users can view own memberships", {
            as: "permissive",
            for: "select",
            to: ["public"],
        }),
    ],
);

export const stores = pgTable(
    "stores",
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        name: text().notNull(),
        slug: text().notNull(),
        address: text(),
        phoneNumber: text("phone_number"),
        logoUrl: text("logo_url"),
        bannerUrl: text("banner_url"),
        joinCode: text("join_code"),
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "string",
        }).defaultNow(),
        updatedAt: timestamp("updated_at", {
            withTimezone: true,
            mode: "string",
        }).defaultNow(),
        deletedAt: timestamp("deleted_at", { mode: "string" }),
        modifiedBy: uuid("modified_by"),
    },
    (table) => [
        index("stores_name_idx").using(
            "btree",
            table.name.asc().nullsLast().op("text_ops"),
        ),
        foreignKey({
            columns: [table.modifiedBy],
            foreignColumns: [users.id],
            name: "stores_modified_by_users_id_fk",
        }).onDelete("set null"),
        unique("stores_slug_unique").on(table.slug),
        unique("stores_join_code_unique").on(table.joinCode),
    ],
);
