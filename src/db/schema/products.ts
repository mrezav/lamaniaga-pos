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
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
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
        merk: text().notNull(),
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
        unique("products_slug_unique").on(table.storeId, table.slug),

        // Menggunakan Partial Index - Aman untuk Soft Delete
        uniqueIndex("products_store_slug_partial_idx")
            .on(table.storeId, table.slug)
            .where(sql`deleted_at IS NULL`),

        index("products_store_id_idx").on(table.storeId),
        index("products_category_id_idx").on(table.categoryId),
        index("products_name_idx").on(table.name),

        // ⚡ INDEKS GIN UNTUK FULL-TEXT SEARCH
        index("products_fts_idx").using(
            "gin",
            sql`to_tsvector('indonesian', ${table.name} || ' ' || COALESCE(${table.merk}, ''))`,
        ),
    ],
);

// ─── 2. TABEL PRODUCT VARIANTS ───
export const productVariants = pgTable(
    "product_variants",
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        productId: uuid("product_id"),
        sku: text().notNull(),
        price: numeric({ precision: 15, scale: 2 }).default("0").notNull(),
        stock: numeric({ precision: 8, scale: 2 }).default("0").notNull(),
        unit: text("unit").notNull().default("pcs"),
        // attributes: jsonb().default({}).notNull(),
        // Menentikan properti ini hanya dimiliki oleh sebagian kecil produk, dan jika nilainya berbeda, ia berpotensi mengubah harga atau stok seperti (ukuran dan warna)
        attributes: jsonb("attributes")
            .$type<Record<string, string | number | boolean>>()
            .default({})
            .notNull(),
        imageUrl: text("image_url"),

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
        // 👈 WAJIB TAMBAHKAN INI: Membuat kombinasi kedua kolom menjadi unik
        unique("product_variants_product_id_unique").on(
            table.id,
            table.productId,
        ),

        unique("product_variants_sku_unique").on(table.storeId, table.sku),
        index("product_variants_sku_idx").on(table.sku),

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
export type NewProductInput = Omit<typeof products.$inferInsert, "id">;
export type ProductVariantRow = typeof productVariants.$inferSelect;
export type NewVariantInput = Omit<typeof productVariants.$inferInsert, "id">;

export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),

    variants: many(productVariants),
}));

export const productVariantsRelations = relations(
    productVariants,
    ({ one }) => ({
        product: one(products, {
            fields: [productVariants.productId],
            references: [products.id],
        }),
    }),
);
