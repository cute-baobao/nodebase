import { execution, NodeType } from "@/db";
import db from "@/db/instance";
import { checkWorkflowActive } from "@/features/triggers/utils/check-workflow-active";
import { WorkflowDb } from "@/features/workflows/server/routers";
import { getExecutor } from "@/lib/configs/executor-registry";
import { and, eq } from "drizzle-orm";
import { NonRetriableError } from "inngest";
import {
  cronTriggerChannel,
  deepseekChannel,
  discordChannel,
  geminiChannel,
  googleFormTriggerChannel,
  httpRequestChannel,
  manualTriggerChannel,
  openaiChannel,
  resendChannel,
} from "./channels";
import { inngest } from "./client";
import {
  calculateNextRun,
  sendWorkflowExecution,
  topologicalSort,
} from "./utils";

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
      resendChannel(),
      cronTriggerChannel(),
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

    const [e] = await step.run("create-execution-record", async () => {
      return await db
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
        executionId: e.id,
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

export const scheduleWorkflowExecution = inngest.createFunction(
  {
    id: "schedule-workflow-execution",
    name: "Schedule Workflow Execution",
    cancelOn: [
      {
        event: "workflows/cancel.workflow",
        match: "data.workflowId",
      },
    ],
  },
  {
    event: "workflows/schedule.workflow",
  },
  async ({ event, step }) => {
    const { workflowId, cronExpression, tz } = event.data;

    if (!workflowId) {
      throw new NonRetriableError("No workflow ID provided");
    }

    await step.run("check-workflow-active", async () => {
      await checkWorkflowActive(workflowId);
    });

    await step.run("execute-workflow", async () => {
      await sendWorkflowExecution({
        workflowId,
        initialData: {
          cronTrigger: {
            scheduledTime: new Date().toISOString(),
          },
        },
      });
    });

    await step.run("reschedule-next", async () => {
      const nextRun = calculateNextRun(cronExpression, tz);
      return inngest.send({
        name: "workflows/schedule.workflow",
        data: { workflowId },
        ts: nextRun.getTime(),
      });
    });

    return {
      status: "scheduled",
      workflowId,
      nextRun: calculateNextRun(cronExpression, tz),
    };
  },
);
