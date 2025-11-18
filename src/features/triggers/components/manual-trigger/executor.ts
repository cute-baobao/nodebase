import { NodeExecutor } from "@/features/executions/type";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";
import { updateNodeStatus } from "@/inngest/utils";
import { NodeStatus } from "@/lib/configs/workflow-constants";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  data,
  executionId,
  nodeId,
  context,
  step,
  publish,
}) => {
  const channel = manualTriggerChannel();

  const changeNodeStatusUtil = async (status: NodeStatus) => {
    await step.run("update-manual-trigger-node-status", async () => {
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

    const result = await step.run("manual-trigger", async () => context);

    await changeNodeStatusUtil("success");
    return result;
  } catch (error) {
    await changeNodeStatusUtil("error");
    throw error;
  }
};
