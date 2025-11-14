import { InferSelectModel } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { workflow } from "./workflow-schema";

export const executionStatus = pgEnum("execution_status", [
  "SUCCESS",
  "FAILED",
  "RUNNING",
]);

export const executionStatusValue = executionStatus.enumValues;

export type ExecutionStatus = (typeof executionStatusValue)[number];

export const execution = pgTable(
  "execution",
  {
    id: uuid().defaultRandom().primaryKey(),
    status: executionStatus().default("RUNNING").notNull(),
    inngestEventId: text("inngest_event_id").unique().notNull(),
    error: text(),
    errorStack: text(),
    workflowId: uuid()
      .references(() => workflow.id, { onDelete: "cascade" })
      .notNull(),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    output: jsonb(),
    nodeStatus: jsonb().default("{}"),
  },
  (table) => [
    index("execution_workflowId_startedAt").on(
      table.workflowId,
      table.startedAt,
    ),
  ],
);

export type Execution = InferSelectModel<typeof execution>;
