import { pgEnum, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./fields";
import { user } from "./auth-schema";
import { InferSelectModel } from "drizzle-orm";

export const credentialType = pgEnum("credential_type", ["OPENAI", "GEMINI", "DEEPSEEK"])

export const credential = pgTable("credential", {
    id: uuid().defaultRandom().primaryKey(),
    name: text().notNull(),
    type: credentialType().notNull(),
    value: text().notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }).notNull(),
    ...timestamps
})

export type Credential = InferSelectModel<typeof credential>;