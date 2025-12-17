import { NodeStatus } from "@/lib/configs/workflow-constants";
import { channel, topic } from "@inngest/realtime";

export const DELAY_NAME = "delay-execution";

export const delayChannel = channel(DELAY_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: NodeStatus;
  }>(),
);
