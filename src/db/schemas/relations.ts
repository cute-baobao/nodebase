import { relations } from "drizzle-orm/relations";
import { credential } from "./credential-schema";
import { user } from "./auth-schema";
import { connection, node, workflow } from "./workflow-schema";

export const userRelations = relations(user, ({ many }) => ({
  workflows: many(workflow),
  credentials: many(credential),
}));

export const credentialRelations = relations(credential, ({ one }) => ({
    user: one(user, { fields: [credential.userId], references: [user.id] }),
}))


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
  credential: one(credential, {
    fields: [node.credentialId],
    references: [credential.id],
  }),
}));

export const connectionRelations = relations(connection, ({ one }) => ({
  workflow: one(workflow, {
    fields: [connection.workflowId],
    references: [workflow.id],
  }),
}));
// relations
