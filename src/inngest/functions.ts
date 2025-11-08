import { NodeType } from "@/db";
import { getExecutor } from "@/features/executions/components/lib/executor-registry";
import { WorkflowDb } from "@/features/workflows/server/routers";
import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { topologicalSort } from "./utils";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflows/execute.workflow" },
  async ({ event, step }) => {
    const workflowId = event.data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("No workflow ID provided");
    }

    await step.sleep("test", "5s");

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const flow = await WorkflowDb.getOneWithoutUser({ workflowId });
      return topologicalSort(flow.nodes, flow.connections);
    });

    // Initialize the context with any initial data from the trigger
    let context = event.data.initialData || {};

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
      });
    }

    return { workflowId, result: context };
  },
);
