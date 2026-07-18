import {
    pgTable,
    text,
    timestamp,
    uuid,
    foreignKey,
    index,
    unique,
    date,
    boolean,
    numeric,
    pgPolicy,
} from "drizzle-orm/pg-core";
import { stores, users, productVariants } from "@/db/schema";
import { relations, sql } from "drizzle-orm";

// Pastikan relasi tabel eksternal ini di-import dengan benar
// import { stores, users, productVariants } from "./schema-katalog";

// =========================================================================
// 1. TABEL TRANSACTION (Single Source of Truth Finansial & Status Nota)
// =========================================================================
export const PaymentStatus = {
    PAID: "paid",
    UNPAID: "unpaid",
    PARTIAL: "partial",
    OVERDUE: "overdue",
    CANCELLED: "cancelled",
} as const;

export const paymentStatusOptions = [
    { value: "all", label: "Semua Status" },
    { value: PaymentStatus.PAID, label: "Lunas" },
    { value: PaymentStatus.UNPAID, label: "Belum Dibayar" },
    { value: PaymentStatus.PARTIAL, label: "Dibayar Sebagian" },
    { value: PaymentStatus.OVERDUE, label: "Jatuh Tempo" },
    { value: PaymentStatus.CANCELLED, label: "Dibatalkan" },
] as const;

export const PaymentStatusValues = [
    PaymentStatus.PAID,
    PaymentStatus.UNPAID,
    PaymentStatus.PARTIAL,
    PaymentStatus.OVERDUE,
    PaymentStatus.CANCELLED,
] as const;

export type PaymentStatus = (typeof PaymentStatusValues)[number];

export const transactions = pgTable(
    "transactions",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        storeId: uuid("store_id"),
        userId: uuid("user_id"),
        cashierName: text("cashier_name").notNull(),
        buyerName: text("buyer_name"),
        buyerPhone: text("buyer_phone_number"),
        invoiceNumber: text("invoice_number").notNull(),
        subtotal: numeric({ precision: 15, scale: 2 }).notNull(),
        discount: numeric({ precision: 15, scale: 2 }).default("0").notNull(),
        tax: numeric({ precision: 15, scale: 2 }).default("0").notNull(),
        totalAmount: numeric("total_amount", {
            precision: 15,
            scale: 2,
        }).notNull(),
        paymentStatus: text("payment_status", { enum: PaymentStatusValues })
            .default(PaymentStatus.UNPAID)
            .notNull(),
        isInstallment: boolean("is_installment").default(false).notNull(), // Diperketat dengan notNull()
        dueDate: date("due_date"),
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
    },
    (table) => [
        pgPolicy("Manage transactions in owned stores", {
            as: "permissive",
            for: "all",
            to: ["authenticated"],
            using: sql`store_id IN (SELECT owned_store_ids())`,
            withCheck: sql`store_id IN (SELECT owned_store_ids())`,
        }),
        foreignKey({
            columns: [table.storeId],
            foreignColumns: [stores.id],
            name: "transactions_store_id_fkey",
        }).onDelete("cascade"),

        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: "transactions_user_id_fkey",
        }).onDelete("restrict"),

        unique("transactions_store_id_transaction_number_unique").on(
            table.storeId,
            table.invoiceNumber,
        ),

        index("transactions_store_id_payment_status_idx").on(
            table.storeId,
            table.paymentStatus,
        ),

        index("transactions_user_id_idx").on(table.userId),
    ],
);

// =========================================================================
// 2. TABEL TRANSACTION_ITEMS (Snapshot Barang Detail)
// =========================================================================
export const transactionItems = pgTable(
    "transaction_items",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        transactionId: uuid("transaction_id"),
        productId: uuid("product_id"),
        variantId: uuid("variant_id"),
        productName: text("product_name").notNull(),
        productMerk: text("product_merk"),
        variantSku: text("variant_sku"),
        price: numeric({ precision: 15, scale: 2 }).notNull(),
        quantity: numeric({ precision: 10, scale: 3 }).notNull(),
        subtotal: numeric({ precision: 15, scale: 2 }).notNull(),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "string",
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        pgPolicy("Member can access via transaction parent", {
            as: "permissive",
            for: "all",
            to: ["authenticated"],
            // Cukup cek apakah transaction_id ini eksis di tabel transaksi yang lolos RLS
            using: sql`transaction_id IN (SELECT id FROM transactions)`,
            withCheck: sql`transaction_id IN (SELECT id FROM transactions)`,
        }),
        foreignKey({
            columns: [table.transactionId],
            foreignColumns: [transactions.id],
            name: "transaction_items_transaction_id_fkey",
        }).onDelete("cascade"),

        // 2. COMPOSITE FOREIGN KEY (Mengunci Variant agar WAJIB menjadi milik Product yang bersangkutan)
        // Menggunakan 'set null' demi menjaga data histori transaksi tetap aman walau produk/varian dihapus dari katalog
        foreignKey({
            columns: [table.variantId, table.productId],
            foreignColumns: [productVariants.id, productVariants.productId],
            name: "transaction_items_product_variant_fkey",
        }).onDelete("set null"),

        index("transaction_items_transaction_id_idx").on(table.transactionId),
        index("transaction_items_product_variant_idx").on(
            table.productId,
            table.variantId,
        ),
    ],
);

// =========================================================================
// 3. TABEL TRANSACTION_PAYMENTS (Buku Log Aliran Uang)
// =========================================================================
export const PaymentMethod = {
    CASH: "cash",
    TRANSFER: "transfer",
    QRIS: "qris",
} as const;

export const PaymentMethodValues = [
    PaymentMethod.CASH,
    PaymentMethod.TRANSFER,
    PaymentMethod.QRIS,
] as const;

export type PaymentMethod = (typeof PaymentMethodValues)[number];

export const transactionPayments = pgTable(
    "transaction_payments",
    {
        id: uuid("id").defaultRandom().primaryKey().notNull(),
        transactionId: uuid("transaction_id")
            .notNull()
            .references(() => transactions.id, { onDelete: "cascade" }),
        amountPaid: numeric("amount_paid", {
            precision: 15,
            scale: 2,
        }).notNull(),
        paymentMethod: text("payment_method", {
            enum: PaymentMethodValues,
        }).notNull(),
        note: text("note"),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "string",
        }).defaultNow(),
    },
    (table) => [
        pgPolicy("Member can access via transaction parent", {
            as: "permissive",
            for: "all",
            to: ["authenticated"],
            using: sql`transaction_id IN (SELECT id FROM transactions)`,
            withCheck: sql`transaction_id IN (SELECT id FROM transactions)`,
        }),
        // Menambahkan indeks pada transactionId di tabel pembayaran agar proses pencarian riwayat cicilan nota sangat cepat
        index("transaction_payments_transaction_id_idx").on(
            table.transactionId,
        ),
    ],
);

// 🚀 KUNCI CARA 1: Definisikan Relasi antara Transactions dan TransactionItems
export const transactionsRelations = relations(transactions, ({ many }) => ({
    transactionItems: many(transactionItems),
    transactionPayments: many(transactionPayments),
}));

export const transactionItemsRelations = relations(
    transactionItems,
    ({ one }) => ({
        transaction: one(transactions, {
            fields: [transactionItems.transactionId],
            references: [transactions.id],
        }),
    }),
);
export const transactionPaymentsRelations = relations(
    transactionPayments,
    ({ one }) => ({
        transaction: one(transactions, {
            fields: [transactionPayments.transactionId],
            references: [transactions.id],
        }),
    }),
);

export type Transaction = typeof transactions.$inferSelect;
export type TransactionItem = typeof transactionItems.$inferSelect;
export type TransactionPayment = typeof transactionPayments.$inferSelect;
