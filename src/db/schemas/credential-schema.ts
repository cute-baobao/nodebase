import { InferSelectModel } from "drizzle-orm";
import { pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { timestamps } from "./fields";

export const credentialType = pgEnum("credential_type", [
  "OPENAI",
  "GEMINI",
  "DEEPSEEK",
  "RESEND"
]);

export const CredentialTypeValues = credentialType.enumValues;

export type CredentialType = (typeof CredentialTypeValues)[number];

export const credential = pgTable("credential", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  type: credentialType().notNull(),
  value: text().notNull(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  ...timestamps,
});

export type Credential = InferSelectModel<typeof credential>;
