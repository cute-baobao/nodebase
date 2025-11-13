import db, { NodeType } from "@/db";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { WorkflowDb } from "@/features/workflows/server/routers";
import { eq } from "drizzle-orm";
import { NonRetriableError } from "inngest";
import {
  deepseekChannel,
  googleFormTriggerChannel,
  httpRequestChannel,
  manualTriggerChannel,
} from "./channels";
import { geminiChannel } from "./channels/gemini";
import { openaiChannel } from "./channels/openai";
import { inngest } from "./client";
import { topologicalSort } from "./utils";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      geminiChannel(),
      deepseekChannel(),
      openaiChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const workflowId = event.data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("No workflow ID provided");
    }

    await step.sleep("test", "5s");

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

    if (!userId) {
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

    return { workflowId, result: context };
  },
);
