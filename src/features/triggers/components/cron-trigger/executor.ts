import { NodeExecutor } from "@/features/executions/type";
import { cronTriggerChannel } from "@/inngest/channels";
import { updateNodeStatus } from "@/inngest/utils";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { CronJobData } from "./schema";

type CronTriggerData = Partial<CronJobData>;

export const cronTriggerExecutor: NodeExecutor<CronTriggerData> = async ({
  executionId,
  nodeId,
  context,
  step,
  publish,
}) => {
  const channel = cronTriggerChannel();

  const changeNodeStatusUtil = async (status: NodeStatus) => {
    await step.run("update-cron-trigger-node-status", async () => {
      return updateNodeStatus({
        channel,
        nodeId,
        executionId,
        status,
        publish,
      });
    });
  };

  try {
    await changeNodeStatusUtil("loading");

    const result = await step.run("cron-trigger", async () => context);

    await changeNodeStatusUtil("success");
    return result;
  } catch (error) {
    await changeNodeStatusUtil("error");
    throw error;
  }
};
