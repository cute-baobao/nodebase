
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { channel, topic } from "@inngest/realtime";

export const OPENAI_CHANNEL_NAME = "openai-execution";

export const openaiChannel = channel(OPENAI_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: NodeStatus;
  }>(),
);
