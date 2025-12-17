import { NodeExecutor } from "@/features/executions/type";
import { xCreatePostChannel } from "@/inngest/channels";
import { updateNodeStatus } from "@/inngest/utils";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { TwitterApi } from "twitter-api-v2";
import { checkNodeCanExecute } from "../../utils/check-node-can-execute";
import { XCreatePostData, xCreatePostDataSchema } from "./schema";

type XCreatePostNodeData = Partial<XCreatePostData>;

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

export const xCreatePostExecutor: NodeExecutor<XCreatePostNodeData> = async ({
  data,
  nodeId,
  context,
  step,
  userId,
  publish,
  executionId,
}) => {
  const channel = xCreatePostChannel();
  const changeNodeStatusUtil = async (status: NodeStatus) => {
    await step.run("update-x-create-post-node-status", async () => {
      return updateNodeStatus({
        channel,
        nodeId,
        executionId,
        status,
        publish,
      });
    });
  };
  try {
    await changeNodeStatusUtil("loading");

    await checkNodeCanExecute(nodeId);

    const safeData = xCreatePostDataSchema.safeParse(data);
    if (!safeData.success) {
      throw new NonRetriableError(
        `Invalid data for X Create Post node : ${safeData.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    const result = await step.run("x-create-post", async () => {
      const payload: Record<string, unknown> = {
        text: Handlebars.compile(safeData.data.text)(context),
        reply: safeData.data.in_reply_to_tweet_id
          ? {
              in_reply_to_tweet_id: Handlebars.compile(
                safeData.data.in_reply_to_tweet_id,
              )(context),
            }
          : undefined,
      };

      const userClient = new TwitterApi({
        appKey: process.env.X_APP_KEY!,
        appSecret: process.env.X_APP_SECRET!,
        accessToken: process.env.X_ACCESS_TOKEN!,
        accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
      });

      return await userClient.v2.tweet(payload);
    });

    if (result.errors) {
      throw new NonRetriableError(
        `X Create Post API error: ${result.errors.map((e) => e.title).join(", ")}`,
      );
    }

    await changeNodeStatusUtil("success");

    return {
      ...context,
      [safeData.data.variableName]: {
        data: result.data,
      },
    };
  } catch (error) {
    if (error instanceof NonRetriableError) {
      await changeNodeStatusUtil("error");
    } else {
      await changeNodeStatusUtil("retrying");
    }
    throw error;
  }
};
