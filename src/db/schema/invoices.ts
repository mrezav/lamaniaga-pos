import {
    pgTable,
    text,
    integer,
    timestamp,
    uuid,
    foreignKey,
    index,
    unique,
    date,
} from "drizzle-orm/pg-core";
import { stores, users, productVariants } from "@/db/schema";
import { sql } from "drizzle-orm";

// =========================================================================
// 1. TABEL INVOICES (Single Source of Truth Finansial & Status Nota)
// =========================================================================
export const PaymentStatus = {
    UNPAID: "unpaid",
    CREDIT: "credit",
    PAID: "paid",
    OVERDUE: "overdue",
} as const;
export const PaymentStatusValues = [
    PaymentStatus.PAID,
    PaymentStatus.CREDIT,
    PaymentStatus.OVERDUE,
    PaymentStatus.UNPAID,
] as const;
export type PaymentStatus = (typeof PaymentStatusValues)[number];

export const invoices = pgTable(
    "invoices",
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        storeId: uuid("store_id"),
        // AUDIT AKUN: ID pengguna Supabase/Auth yang membuat invoice ini
        userId: uuid("user_id"), // Restrict: User tidak boleh dihapus jika punya data transaksi

        // Nomor invoice unik toko, contoh format: INV-20260626-0001
        invoiceNumber: text("invoice_number").notNull(),

        // Kalkulasi Keuangan Murni (Menggunakan Integer/Sen untuk menghindari floating point error)
        subtotal: integer("subtotal").notNull(), // Total harga barang sebelum diskon & pajak
        discount: integer("discount").default(0).notNull(), // Potongan nominal manual / promo
        tax: integer("tax").default(0).notNull(), // Nominal PPN terhitung
        totalAmount: integer("total_amount").notNull(), // Total bersih akhir (subtotal - discount + tax)

        // Status Siklus Hidup Pembayaran
        // - PAID = Lunas langsung / cicilan sudah terpenuhi
        // - CREDIT = Cicilan sedang berjalan (Sudah bayar DP / sebagian)
        // - UNPAID = Belum bayar sama sekali (Hutang murni / bon)
        // - OVERDUE = Melewati tanggal jatuh tempo cicilan
        paymentStatus: text("payment_status", { enum: PaymentStatusValues })
            .default(PaymentStatus.UNPAID)
            .notNull(),

        dueDate: date("due_date"), // Batas akhir pelunasan angsuran (opsional jika tunai)
        cashierName: text("cashier_name").notNull(), // Snapshot nama kasir yang melayani saat itu

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
        foreignKey({
            columns: [table.storeId],
            foreignColumns: [stores.id],
            name: "invoices_store_id_fkey",
        }).onDelete("cascade"),

        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: "invoices_user_id_fkey",
        }).onDelete("restrict"), // Menggunakan restrict agar user tidak sengaja terhapus jika punya riwayat transaksi

        // 1. UNIQUE CONSTRAINT GABUNGAN (Menggunakan akhiran _uq)
        unique("invoices_store_id_invoice_number_uq").on(
            table.storeId,
            table.invoiceNumber,
        ),

        // 2. PERFORMANCE INDEX (Ganti 'status' ke 'paymentStatus' jika mengikuti skema sebelumnya)
        index("invoices_store_id_payment_status_idx").on(
            table.storeId,
            table.paymentStatus, // Sesuaikan dengan nama properti kolom kamu
        ),

        // 3. AUDIT INDEX
        index("invoices_user_id_idx").on(table.userId),
    ],
);

// =========================================================================
// 2. TABEL INVOICE_ITEMS (Snapshot Barang Detail Termasuk Merk & Varian)
// =========================================================================
export const invoiceItems = pgTable(
    "invoice_items",
    {
        id: uuid().defaultRandom().primaryKey().notNull(),

        // Kolom Relasi Utama
        invoiceId: uuid("invoice_id"),
        productId: uuid("product_id"),
        variantId: uuid("variant_id"), // Menampung ID Varian (Nullable jika produk tunggal)

        // -----------------------------------------------------------------------
        // SNAPSHOT PATTERN: Mengunci detail fisik produk secara permanen saat dibeli
        // -----------------------------------------------------------------------
        productName: text("product_name").notNull(),
        productMerk: text("product_merk"),
        variantName: text("variant_name"),

        // Data Finansial Item
        price: integer("price").notNull(),
        quantity: integer("quantity").notNull(),
        subtotal: integer("subtotal").notNull(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "string",
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        // 1. RELASI KE INVOICES (Cascade onDelete karena jika nota dihapus, itemnya wajib musnah)
        foreignKey({
            columns: [table.invoiceId],
            foreignColumns: [invoices.id],
            name: "invoice_items_invoice_id_fkey",
        }).onDelete("cascade"),

        // 2. COMPOSITE FOREIGN KEY (Mengunci Variant agar WAJIB menjadi milik Product yang bersangkutan)
        // Menggunakan 'set null' demi menjaga data histori transaksi tetap aman walau produk/varian dihapus dari katalog
        foreignKey({
            columns: [table.productId, table.variantId],
            foreignColumns: [productVariants.productId, productVariants.id],
            name: "invoice_items_product_variant_fkey",
        }).onDelete("set null"),

        // 3. PERFORMANCE INDEX: Untuk mempermudah query report performa penjualan produk/varian terlaris
        index("invoice_items_invoice_id_idx").on(table.invoiceId),
        index("invoice_items_product_variant_idx").on(
            table.productId,
            table.variantId,
        ),
    ],
);

// =========================================================================
// 3. TABEL INVOICE_PAYMENTS (Buku Log Angsuran / Catatan Riwayat Aliran Uang)
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

export const invoicePayments = pgTable("invoice_payments", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    invoiceId: uuid("invoice_id")
        .notNull()
        .references(() => invoices.id, { onDelete: "cascade" }),

    amountPaid: integer("amount_paid").notNull(), // Nominal uang yang disetor pada pembayaran ini
    paymentMethod: text("payment_method", {
        enum: PaymentMethodValues,
    }).notNull(),

    // Catatan penjelas, contoh: "Pembayaran DP awal", "Cicilan ke-2", "Pelunasan Nota"
    notes: text("notes"),

    createdAt: timestamp("created_at", {
        withTimezone: true,
        mode: "string",
    }).defaultNow(),
});
