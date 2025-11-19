
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { channel, topic } from "@inngest/realtime";

export const CRON_TRIGGER_NAME = "cron-trigger-execution";

export const cronTriggerChannel = channel(CRON_TRIGGER_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: NodeStatus;
  }>(),
);
