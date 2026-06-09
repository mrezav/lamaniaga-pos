import {
    pgTable,
    uuid,
    text,
    boolean,
    timestamp,
    foreignKey,
    pgPolicy,
    index,
    unique,
    numeric,
    integer,
    jsonb,
    check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { stores } from "./stores";
import { categories } from "./categories";

// ─── 1. TABEL PRODUCTS ───
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

        // Audit Trail Columns
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
        deletedAt: timestamp("deleted_at"),
        modifiedBy: uuid("modified_by").references(() => users.id, {
            onDelete: "set null",
        }),

        storeId: uuid("store_id"),
    },
    (table) => [
        foreignKey({
            columns: [table.categoryId],
            foreignColumns: [categories.id],
            name: "products_category_id_fkey",
        }).onDelete("set null"),
        foreignKey({
            columns: [table.storeId],
            foreignColumns: [stores.id],
            name: "products_store_id_fkey",
        }).onDelete("cascade"),

        // RLS Policy menggunakan fungsi pembantu global yang sudah aman
        pgPolicy("Manage own products", {
            as: "permissive",
            for: "all",
            to: ["public"],
            using: sql`store_id IN (SELECT owned_store_ids())`,
        }),

        // Catatan Unik: Idealnya slug unik per toko: unique().on(table.storeId, table.slug)
        unique("products_slug_key").on(table.storeId, table.slug),
        index("products_store_id_idx").on(table.storeId),
        index("products_category_id_idx").on(table.categoryId),
    ],
);

// ─── 2. TABEL PRODUCT VARIANTS ───
export const productVariants = pgTable(
    "product_variants",
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        productId: uuid("product_id"),
        sku: text(),
        price: numeric({ precision: 15, scale: 2 }).default("0").notNull(),
        stock: integer().default(0).notNull(),
        attributes: jsonb().default({}).notNull(),

        // Menyuntikkan kolom Audit Trail baru yang ditarik dari standardisasi kita
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
        deletedAt: timestamp("deleted_at"),
        modifiedBy: uuid("modified_by").references(() => users.id, {
            onDelete: "set null",
        }),

        storeId: uuid("store_id"),
    },
    (table) => [
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

        // Memperbaiki RLS lama yang rusak akibat 'owner_id' hilang, diganti ke fungsi terpusat
        pgPolicy("Manage own variants", {
            as: "permissive",
            for: "all",
            to: ["public"],
            using: sql`store_id IN (SELECT owned_store_ids())`,
        }),

        unique("product_variants_sku_key").on(table.sku),

        // Menggunakan index Btree optimasi tinggi hasil tarikan live database kamu
        index("product_variants_product_id_idx").using(
            "btree",
            table.productId.asc().nullsLast().op("uuid_ops"),
        ),
        index("product_variants_store_id_idx").using(
            "btree",
            table.storeId.asc().nullsLast().op("uuid_ops"),
        ),

        // Batasan nilai logis di tingkat database
        check("product_variants_price_check", sql`price >= 0`),
        check("product_variants_stock_check", sql`stock >= 0`),
    ],
);

export type ProductRow = typeof products.$inferSelect;
export type ProductVariantRow = typeof productVariants.$inferSelect;
