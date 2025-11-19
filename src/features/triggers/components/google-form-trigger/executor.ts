import { NodeExecutor } from "@/features/executions/type";
import { googleFormTriggerChannel } from "@/inngest/channels";
import { updateNodeStatus } from "@/inngest/utils";
import { NodeStatus } from "@/lib/configs/workflow-constants";

type GoogleFormTriggerData = Record<string, unknown>;

export const googleFormTriggerExecutor: NodeExecutor<
  GoogleFormTriggerData
> = async ({ data, nodeId, context, step, publish, executionId }) => {
  const channel = googleFormTriggerChannel();
  const changeNodeStatusUtil = async (status: NodeStatus) => {
    await step.run("update-google-form-trigger-node-status", async () => {
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

    const result = await step.run("google-form-trigger", async () => context);

    await changeNodeStatusUtil("success");

    return result;
  } catch (error) {
    await changeNodeStatusUtil("error");
    throw error;
  }
};
