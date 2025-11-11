import { NodeExecutor } from "@/features/executions/type";
import { stripeTriggerChannel } from "@/inngest/channels";

type StripeTriggerData = Record<string, unknown>;

export const stripeTriggerExecutor: NodeExecutor<StripeTriggerData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  try {
    await publish(
      stripeTriggerChannel().status({
        nodeId,
        status: "loading",
      }),
    );

    const result = await step.run("stripe-trigger", async () => context);

    await publish(
      stripeTriggerChannel().status({
        nodeId,
        status: "success",
      }),
    );
    return result;
  } catch (error) {
    await publish(
      stripeTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
