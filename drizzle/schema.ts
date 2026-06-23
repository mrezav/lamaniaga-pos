import { pgTable, index, foreignKey, unique, pgPolicy, uuid, text, timestamp, check, numeric, integer, jsonb, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	storeId: uuid("store_id"),
}, (table) => [
	index("categories_store_id_idx").using("btree", table.storeId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.storeId],
			foreignColumns: [stores.id],
			name: "categories_store_id_fkey"
		}).onDelete("cascade"),
	unique("categories_slug_key").on(table.slug),
	pgPolicy("Manage own categories", { as: "permissive", for: "all", to: ["public"], using: sql`(store_id IN ( SELECT stores.id
   FROM stores
  WHERE (stores.owner_id = auth.uid())))` }),
]);

export const productVariants = pgTable("product_variants", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id"),
	sku: text(),
	price: numeric({ precision: 15, scale:  2 }).default('0').notNull(),
	stock: integer().default(0).notNull(),
	attributes: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	storeId: uuid("store_id"),
}, (table) => [
	index("product_variants_product_id_idx").using("btree", table.productId.asc().nullsLast().op("uuid_ops")),
	index("product_variants_store_id_idx").using("btree", table.storeId.asc().nullsLast().op("uuid_ops")),
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
	pgPolicy("Manage own variants", { as: "permissive", for: "all", to: ["public"], using: sql`(store_id IN ( SELECT stores.id
   FROM stores
  WHERE (stores.owner_id = auth.uid())))` }),
	check("product_variants_price_check", sql`price >= (0)::numeric`),
	check("product_variants_stock_check", sql`stock >= 0`),
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
	index("products_category_id_idx").using("btree", table.categoryId.asc().nullsLast().op("uuid_ops")),
	index("products_store_id_idx").using("btree", table.storeId.asc().nullsLast().op("uuid_ops")),
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
	pgPolicy("Manage own products", { as: "permissive", for: "all", to: ["public"], using: sql`(store_id IN ( SELECT stores.id
   FROM stores
  WHERE (stores.owner_id = auth.uid())))` }),
]);

export const profiles = pgTable("profiles", {
	id: uuid().primaryKey().notNull(),
	fullName: text("full_name").notNull(),
	avatarUrl: text("avatar_url"),
	phoneNumber: text("phone_number"),
	lastActiveStoreId: uuid("last_active_store_id"),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [users.id],
			name: "profiles_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.lastActiveStoreId],
			foreignColumns: [stores.id],
			name: "profiles_last_active_store_id_fkey"
		}).onDelete("set null"),
	pgPolicy("Users can view own profile", { as: "permissive", for: "select", to: ["public"] }),
]);

export const storeMembers = pgTable("store_members", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	storeId: uuid("store_id").notNull(),
	role: text().default('cashier').notNull(),
	status: text().default('active').notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.storeId],
			foreignColumns: [stores.id],
			name: "store_members_store_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "store_members_user_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Users can view own memberships", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Owners can update store members", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Owners can manage their store members", { as: "permissive", for: "all", to: ["public"] }),
	pgPolicy("Owners can insert store members", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Owners can delete store members", { as: "permissive", for: "delete", to: ["public"] }),
]);

export const stores = pgTable("stores", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	ownerId: uuid("owner_id").notNull(),
	slug: text().notNull(),
	address: text(),
	phoneNumber: text("phone_number"),
	logoUrl: text("logo_url"),
	bannerUrl: text("banner_url"),
	joinCode: text("join_code"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("stores_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("stores_owner_id_idx").using("btree", table.ownerId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "stores_owner_id_fkey"
		}),
	unique("stores_slug_unique").on(table.slug),
	unique("stores_join_code_unique").on(table.joinCode),
	pgPolicy("Manage own store", { as: "permissive", for: "all", to: ["public"], using: sql`(auth.uid() = owner_id)` }),
]);
