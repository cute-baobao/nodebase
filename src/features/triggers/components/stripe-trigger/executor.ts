import { NodeExecutor } from "@/features/executions/type";
import { stripeTriggerChannel } from "@/inngest/channels";
import { updateNodeStatus } from "@/inngest/utils";
import { NodeStatus } from "@/lib/configs/workflow-constants";

type StripeTriggerData = Record<string, unknown>;

export const stripeTriggerExecutor: NodeExecutor<StripeTriggerData> = async ({
  data,
  nodeId,
  context,
  step,
  executionId,
  publish,
}) => {
  const channel = stripeTriggerChannel();
  const changeNodeStatusUtil = async (status: NodeStatus) => {
    await step.run("update-stripe-trigger-node-status", async () => {
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

    const result = await step.run("stripe-trigger", async () => context);

    await changeNodeStatusUtil("success");
    return result;
  } catch (error) {
    await changeNodeStatusUtil("error");
    throw error;
  }
};
