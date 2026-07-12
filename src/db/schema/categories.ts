import {
    pgTable,
    foreignKey,
    unique,
    pgPolicy,
    uuid,
    text,
    timestamp,
    index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { stores } from "./stores";
import { users } from "./users";
import { products } from "./products";

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
            columns: [table.storeId],
            foreignColumns: [stores.id],
            name: "categories_store_id_fkey",
        }).onDelete("cascade"),

        // ⚠️ CATATAN UNIQUE: Jika slug unik global, biarkan seperti ini.
        // Tapi jika slug hanya boleh unik per toko, ganti menjadi: unique().on(table.storeId, table.slug)
        unique("categories_slug_unique").on(table.storeId, table.slug),
        index("categories_store_id_idx").on(table.storeId),

        // ⚡ INDEKS GIN UNTUK KATEGORI (KARENA BERBEDA TABEL)
        index("categories_fts_idx").using(
            "gin",
            sql`to_tsvector('indonesian', ${table.name})`,
        ),

        // Pola fungsi pembantu (owned_store_ids()) ini sudah sangat bagus dan bersih!
        pgPolicy("Manage own categories", {
            as: "permissive",
            for: "all",
            to: ["public"],
            using: sql`store_id IN (SELECT owned_store_ids())`,
        }),
    ],
);

export type CategoryRow = typeof categories.$inferInsert;

export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products),
}));
