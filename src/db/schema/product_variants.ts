// import {
//     pgTable,
//     foreignKey,
//     unique,
//     pgPolicy,
//     uuid,
//     text,
//     timestamp,
//     numeric,
//     integer,
//     jsonb,
//     index,
//     check,
// } from "drizzle-orm/pg-core";
// import { sql } from "drizzle-orm";
// import { stores } from "./stores";
// import { products } from "./products";

// export const productVariants = pgTable(
//     "product_variants",
//     {
//         id: uuid().defaultRandom().primaryKey().notNull(),
//         productId: uuid("product_id"),
//         sku: text(),
//         price: numeric({ precision: 15, scale: 2 }).default("0").notNull(),
//         stock: integer().default(0).notNull(),
//         attributes: jsonb().default({}).notNull(),
//         createdAt: timestamp("created_at", {
//             withTimezone: true,
//             mode: "string",
//         }).defaultNow(),
//         storeId: uuid("store_id"),
//     },
//     (table) => [
//         index("product_variants_product_id_idx").using(
//             "btree",
//             table.productId.asc().nullsLast().op("uuid_ops"),
//         ),
//         index("product_variants_store_id_idx").using(
//             "btree",
//             table.storeId.asc().nullsLast().op("uuid_ops"),
//         ),
//         foreignKey({
//             columns: [table.productId],
//             foreignColumns: [products.id],
//             name: "product_variants_product_id_fkey",
//         }).onDelete("cascade"),
//         foreignKey({
//             columns: [table.storeId],
//             foreignColumns: [stores.id],
//             name: "product_variants_store_id_fkey",
//         }).onDelete("cascade"),
//         unique("product_variants_sku_key").on(table.sku),
//         pgPolicy("Manage own variants", {
//             as: "permissive",
//             for: "all",
//             to: ["public"],
//             using: sql`(store_id IN ( SELECT stores.id
//    FROM stores
//   WHERE (stores.owner_id = auth.uid())))`,
//         }),
//         check("product_variants_price_check", sql`price >= (0)::numeric`),
//         check("product_variants_stock_check", sql`stock >= 0`),
//     ],
// );
