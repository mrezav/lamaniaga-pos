import { pgSchema, uuid, text } from "drizzle-orm/pg-core";

export const authSchema = pgSchema("auth");

export const users = authSchema.table("users", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: text().notNull(),
});

// Tambahkan secara manual di
// - drizzle/Schema.ts : import { users } from "@/db/schema/users";
// - drizzle/relations.ts : import { users as usersInAuth } from "@/db/schema/users";
