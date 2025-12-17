import { NodeExecutor } from "@/features/executions/type";
import { delayChannel } from "@/inngest/channels";
import { updateNodeStatus } from "@/inngest/utils";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { NonRetriableError } from "inngest";
import { checkNodeCanExecute } from "../../utils/check-node-can-execute";
import { DelayData, delayDataSchema } from "./schema";

type DelayNodeData = Partial<DelayData>;

export const delayExecutor: NodeExecutor<DelayNodeData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
  executionId,
}) => {
  const channel = delayChannel();
  const changeNodeStatusUtil = async (status: NodeStatus) => {
    await step.run("update-delay-node-status", async () => {
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

    await checkNodeCanExecute(nodeId);

    const safeData = delayDataSchema.safeParse(data);
    if (!safeData.success) {
      throw new NonRetriableError(
        `Invalid data for Delay node: ${safeData.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    await step.sleep("delay-sleep", `${safeData.data.duration}ms`);

    await changeNodeStatusUtil("success");

    return context;
  } catch (error) {
    if (error instanceof NonRetriableError) {
      await changeNodeStatusUtil("error");
    } else {
      await changeNodeStatusUtil("retrying");
    }
    throw error;
  }
};
