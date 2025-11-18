import { NodeStatus } from "@/lib/configs/workflow-constants";
import { channel, topic } from "@inngest/realtime";

export const RESEND_CHANNEL_NAME = "resend-execution";

export const resendChannel = channel(RESEND_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: NodeStatus;
  }>(),
);
