import { InferSelectModel, relations } from "drizzle-orm";
import { json, pgEnum, pgTable, text, unique, uuid } from "drizzle-orm/pg-core";
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

// === node type ===
export const nodeType = pgEnum("node_type", [
  "INITIAL",
  "MANUAL_TRIGGER",
  "HTTP_REQUEST",
  "GOOGLE_FORM_TRIGGER",
  "STRIPE_TRIGGER",
]);

export const NodeTypeValues = nodeType.enumValues;

export type NodeType = (typeof nodeType.enumValues)[number];
// === node type ===

// === node ===
export const node = pgTable("node", {
  id: uuid().defaultRandom().primaryKey(),
  workflowId: uuid("workflow_id")
    .references(() => workflow.id, { onDelete: "cascade" })
    .notNull(),
  name: text().notNull(),
  type: nodeType().notNull(),
  position: json(),
  data: json().default("{}"),
  ...timestamps,
});

export type Node = InferSelectModel<typeof node>;
// === node ===

// === connection ===
export const connection = pgTable(
  "connection",
  {
    id: uuid().defaultRandom().primaryKey(),
    workflowId: uuid("workflow_id")
      .references(() => workflow.id, { onDelete: "cascade" })
      .notNull(),
    fromNodeId: uuid("from_node_id")
      .references(() => node.id, { onDelete: "cascade" })
      .notNull(),
    toNodeId: uuid("to_node_id")
      .references(() => node.id, { onDelete: "cascade" })
      .notNull(),
    fromOutput: text("from_output").default("main"),
    toInput: text("to_input").default("main"),
    ...timestamps,
  },
  (t) => [unique().on(t.fromNodeId, t.toNodeId, t.fromOutput, t.toInput)],
);

export type Connection = InferSelectModel<typeof connection>;
// === connection ===

// relations
export const workflowRelations = relations(workflow, ({ many }) => ({
  nodes: many(node),
  connections: many(connection),
}));

export const nodeRelations = relations(node, ({ one }) => ({
  workflow: one(workflow, {
    fields: [node.workflowId],
    references: [workflow.id],
  }),
}));

export const connectionRelations = relations(connection, ({ one }) => ({
  workflow: one(workflow, {
    fields: [connection.workflowId],
    references: [workflow.id],
  }),
}));
// relations
