import { InferSelectModel } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { timestamps } from "./fields";

// === workflow ===
export const workflow = pgTable("workflow", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  ...timestamps,
});

export type Workflow = InferSelectModel<typeof workflow>;
// === workflow ===
