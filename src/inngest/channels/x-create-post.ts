import { NodeStatus } from "@/lib/configs/workflow-constants";
import { channel, topic } from "@inngest/realtime";

export const X_CREATE_POST_NAME = "x-create-post-execution";

export const xCreatePostChannel = channel(X_CREATE_POST_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: NodeStatus;
  }>(),
);
