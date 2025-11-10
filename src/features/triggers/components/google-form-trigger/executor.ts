import { NodeExecutor } from "@/features/executions/type";
import { googleFormTriggerChannel } from "@/inngest/channels";

type GoogleFormTriggerData = Record<string, unknown>;

export const GoogleFormTriggerExecutor: NodeExecutor<GoogleFormTriggerData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  try {
    await publish(
      googleFormTriggerChannel().status({
        nodeId,
        status: "loading",
      }),
    );

    const result = await step.run("google-form-trigger", async () => context);

    await publish(
      googleFormTriggerChannel().status({
        nodeId,
        status: "success",
      }),
    );
    return result;
  } catch (error) {
    await publish(
      googleFormTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
