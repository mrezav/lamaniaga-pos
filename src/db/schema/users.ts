import { pgSchema, uuid, text } from "drizzle-orm/pg-core"

export const authSchema = pgSchema("auth")

export const users = authSchema.table("users", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: text().notNull(),
});
