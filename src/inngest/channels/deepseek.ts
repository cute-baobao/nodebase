
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { channel, topic } from "@inngest/realtime";

export const DEEPSEEK_CHANNEL_NAME = "deepseek-execution";

export const deepseekChannel = channel(DEEPSEEK_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: NodeStatus;
  }>(),
);
