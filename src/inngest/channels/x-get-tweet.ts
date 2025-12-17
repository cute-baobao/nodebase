import { NodeStatus } from "@/lib/configs/workflow-constants";
import { channel, topic } from "@inngest/realtime";

export const X_GET_TWEET_NAME = "x-get-tweet-execution";

export const xGetTweetChannel = channel(X_GET_TWEET_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: NodeStatus;
  }>(),
);
