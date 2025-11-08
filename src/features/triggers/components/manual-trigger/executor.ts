import { NodeExecutor } from "@/features/executions/components/type";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  // TODO: Publish loading state for manual trigger node
  const result = await step.run("manual-trigger", async () => context);

  // TODO: Publish success state for manual trigger node
  return result;
};
