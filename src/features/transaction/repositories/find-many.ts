import { db } from "@/db";
import { FindTransactionsFilters } from "../types";
import { transactionItems, transactions } from "@/db/schema";
import { and, asc, count, desc, eq, gte, ilike, lte, SQL } from "drizzle-orm";

export async function findTransactions(filters: FindTransactionsFilters) {
    const {
        storeId,
        search,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        paymentStatus = "all",
        startDate,
        endDate,
    } = filters;

    const conditions: SQL[] = [];
    if (storeId) {
        conditions.push(eq(transactions.storeId, storeId));
    }
    if (paymentStatus && paymentStatus !== "all") {
        conditions.push(eq(transactions.paymentStatus, paymentStatus));
    }
    if (search) {
        // Mencari berdasarkan nomor invoice (case-insensitive)
        conditions.push(ilike(transactions.invoiceNumber, `%${search}%`));
    }

    if (startDate) {
        conditions.push(gte(transactions.createdAt, startDate));
    }

    if (endDate) {
        const endString = endDate.includes("T")
            ? endDate
            : `${endDate}T23:59:59.999Z`;
        conditions.push(lte(transactions.createdAt, endString));
    }

    const whereClause = and(...conditions);

    const orderColumn =
        sortBy === "totalAmount"
            ? transactions.totalAmount
            : transactions.createdAt;
    const orderByClause =
        sortOrder === "asc" ? asc(orderColumn) : desc(orderColumn);

    // 3. Hitung offset untuk pagination
    const offset = (page - 1) * limit;
    // 1. Kueri Hitung Total Transaksi Mandiri (Cepat & Akurat)
    const [countResult, items] = await Promise.all([
        db.select({ total: count() }).from(transactions).where(whereClause),

        // 2. Kueri Data Relasional Prisma-like
        db.query.transactions.findMany({
            where: whereClause,
            orderBy: orderByClause,
            limit: limit,
            offset: offset,
            // Otomatis men-join dan memformat transactionItems menjadi array di dalam object transaction
            with: {
                transactionItems: true,
            },
        }),
    ]);

    const totalItems = countResult[0]?.total ?? 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
        items, // Berisi array data transaksi
        pagination: {
            page,
            limit,
            totalItems,
            totalPages,
        },
    };
}
