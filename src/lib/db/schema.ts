import { pgSchema, pgTable, foreignKey, unique, pgPolicy, uuid, text, timestamp, boolean, numeric, integer, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const authSchema = pgSchema("auth")

export const users = authSchema.table("users", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: text().notNull(),
});

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
    pgPolicy("Manage own categories", {
        as: "permissive", for: "all", to: ["public"], using: sql`(store_id IN ( SELECT stores.id
   FROM stores
  WHERE (stores.owner_id = auth.uid())))` }),
]);

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

export const stores = pgTable("stores", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    // Info Identitas & Branding
    address: text("address"),
    phoneNumber: text("phone_number"),
    logoUrl: text("logo_url"),     // URL dari Supabase Storage
    bannerUrl: text("banner_url"), // URL dari Supabase Storage
    ownerId: uuid("owner_id"), // FK ke users
    // Pengaturan Bisnis
    joinCode: text("join_code").unique(), // Kode unik untuk join
    isActive: boolean("is_active").default(true).notNull(), // Status toko
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(), // Waktu pembuatan
}, (table) => [
    foreignKey({
        columns: [table.ownerId],
        foreignColumns: [users.id],
        name: "stores_owner_id_fkey"
    }),
    pgPolicy("Manage own store", { as: "permissive", for: "all", to: ["public"], using: sql`(auth.uid() = owner_id)` }),
]);


export const profiles = pgTable("profiles", {
    // ID harus sama dengan ID di auth.users Supabase
    id: uuid("id").primaryKey().notNull(),

    fullName: text("full_name").notNull(),
    avatarUrl: text("avatar_url"),
    phoneNumber: text("phone_number"),

    // Relasi ke Toko
    storeId: uuid("store_id"),

    // Role & Status untuk Multi-tenant Approval
    role: text("role", { enum: ["owner", "manager", "cashier"] }).default("cashier"),
    status: text("status", { enum: ["idle", "pending", "active", "rejected"] }).default("idle"),

    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
        .defaultNow()
        .$onUpdate(() => sql`now()`),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
    // Foreign Key ke tabel Auth Users (Internal Supabase)
    foreignKey({
        columns: [table.id],
        foreignColumns: [users.id], // Pastikan import authUsers sesuai setup Anda
        name: "profiles_id_fkey"
    }).onDelete("cascade"),

    // Foreign Key ke tabel Stores
    foreignKey({
        columns: [table.storeId],
        foreignColumns: [stores.id],
        name: "profiles_store_id_fkey"
    }).onDelete("set null"),

    // RLS: User hanya bisa melihat profil mereka sendiri
    pgPolicy("Users can view own profile", {
        as: "permissive",
        for: "select",
        to: ["public"],
        using: sql`(auth.uid() = id)`
    }),

    // RLS: Owner bisa melihat semua profile yang mendaftar ke tokonya
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