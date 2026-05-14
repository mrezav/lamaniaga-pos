import { pgTable, foreignKey, unique, pgPolicy, uuid, text, timestamp, boolean, numeric, integer, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { stores } from "./stores";
import { categories } from "./categories";

export const products = pgTable("products", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    categoryId: uuid("category_id"),
    name: text().notNull(),
    slug: text().notNull(),
    description: text(),
    imageUrl: text("image_url"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    storeId: uuid("store_id"),
}, (table) => [
    foreignKey({
        columns: [table.categoryId],
        foreignColumns: [categories.id],
        name: "products_category_id_fkey"
    }).onDelete("set null"),
    foreignKey({
        columns: [table.storeId],
        foreignColumns: [stores.id],
        name: "products_store_id_fkey"
    }).onDelete("cascade"),
    unique("products_slug_key").on(table.slug),
    pgPolicy("Manage own products", {
        as: "permissive", for: "all", to: ["public"], using: sql`(store_id IN ( SELECT stores.id
   FROM stores
  WHERE (stores.owner_id = auth.uid())))` }),
]);

export const productVariants = pgTable("product_variants", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    productId: uuid("product_id"),
    sku: text(),
    price: numeric({ precision: 15, scale: 2 }).default('0').notNull(),
    stock: integer().default(0).notNull(),
    attributes: jsonb().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    storeId: uuid("store_id"),
}, (table) => [
    foreignKey({
        columns: [table.productId],
        foreignColumns: [products.id],
        name: "product_variants_product_id_fkey"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.storeId],
        foreignColumns: [stores.id],
        name: "product_variants_store_id_fkey"
    }).onDelete("cascade"),
    unique("product_variants_sku_key").on(table.sku),
    pgPolicy("Manage own variants", {
        as: "permissive", for: "all", to: ["public"], using: sql`(store_id IN ( SELECT stores.id
   FROM stores
  WHERE (stores.owner_id = auth.uid())))` }),
]);
