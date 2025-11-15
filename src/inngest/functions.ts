import { execution, NodeType } from "@/db";
import db from "@/db/instance";
import { getExecutor } from "@/lib/configs/executor-registry";
import { WorkflowDb } from "@/features/workflows/server/routers";
import { and, eq } from "drizzle-orm";
import { NonRetriableError } from "inngest";
import {
  deepseekChannel,
  googleFormTriggerChannel,
  httpRequestChannel,
  manualTriggerChannel,
} from "./channels";
import { discordChannel } from "./channels/discord";
import { geminiChannel } from "./channels/gemini";
import { openaiChannel } from "./channels/openai";
import { inngest } from "./client";
import { topologicalSort } from "./utils";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    onFailure: async ({ event, step }) => {
      return await step.run("mark-execution-failed", async () => {
        return db
          .update(execution)
          .set({
            status: "FAILED",
            error: event.data.error.message,
            errorStack: event.data.error.stack,
          })
          .where(and(eq(execution.inngestEventId, event.data.event.id!)));
      });
    },
  },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      geminiChannel(),
      deepseekChannel(),
      openaiChannel(),
      discordChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;

    if (!workflowId || !inngestEventId) {
      throw new NonRetriableError(
        "No workflow ID or Inngest event ID provided",
      );
    }

    await step.run("create-execution-record", async () => {
      return db
        .insert(execution)
        .values({
          workflowId,
          inngestEventId,
        })
        .returning();
    });

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const flow = await WorkflowDb.getOneWithoutUser({ workflowId });
      return topologicalSort(flow.nodes, flow.connections);
    });

    const userId = await step.run("get-user-id", () => {
      return db.query.workflow.findFirst({
        where: (wf) => eq(wf.id, workflowId),
        columns: {
          userId: true,
        },
      });
    });

    if (!userId?.userId) {
      throw new NonRetriableError("No user found for workflow");
    }
    // Initialize the context with any initial data from the trigger
    let context = event.data.initialData || {};

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        userId: userId.userId,
        context,
        step,
        publish,
      });
    }

    await step.run("finalize-execution", async () => {
      return db
        .update(execution)
        .set({ completedAt: new Date(), status: "SUCCESS", output: context })
        .where(
          and(
            eq(execution.workflowId, workflowId),
            eq(execution.inngestEventId, inngestEventId),
          ),
        );
    });

    return { workflowId, result: context };
  },
);
