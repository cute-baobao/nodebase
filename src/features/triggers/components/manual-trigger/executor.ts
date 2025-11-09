import { NodeExecutor } from "@/features/executions/type";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  try {
    await publish(
      manualTriggerChannel().status({
        nodeId,
        status: "loading",
      }),
    );

    const result = await step.run("manual-trigger", async () => context);

    await publish(
      manualTriggerChannel().status({
        nodeId,
        status: "success",
      }),
    );
    return result;
  } catch (error) {
    await publish(
      manualTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
