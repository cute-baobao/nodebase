import { NodeExecutor } from "@/features/executions/type";
import { xGetTweetChannel } from "@/inngest/channels";
import { updateNodeStatus } from "@/inngest/utils";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { TwitterApi } from "twitter-api-v2";
import { checkNodeCanExecute } from "../../utils/check-node-can-execute";
import { XGetTweetData, xGetTweetDataSchema } from "./schema";

type XGetTweetNodeData = Partial<XGetTweetData>;

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type CronTrigger = {
  count: number;
  scheduledTime: string;
};

export const xGetTweetExecutor: NodeExecutor<XGetTweetNodeData> = async ({
  data,
  nodeId,
  context,
  step,
  userId,
  publish,
  executionId,
}) => {
  const channel = xGetTweetChannel();
  const changeNodeStatusUtil = async (status: NodeStatus) => {
    await step.run("update-x-get-tweet-node-status", async () => {
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

    const safeData = xGetTweetDataSchema.safeParse(data);
    if (!safeData.success) {
      throw new NonRetriableError(
        `Invalid data for X Get Tweet node : ${safeData.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    const result = await step.run("x-get-tweet", async () => {
      const contextCronTrigger = context.cronTrigger as CronTrigger | undefined;

      // 只有当配置了since过滤且有cron触发器时，才需要startTime
      const shouldUseSinceFilter = safeData.data.since && contextCronTrigger;
      const isFirstRun = contextCronTrigger?.count === 1;
      const startTime = shouldUseSinceFilter && !isFirstRun
        ? contextCronTrigger.scheduledTime
        : undefined;

      const userClient = new TwitterApi({
        appKey: process.env.X_APP_KEY!,
        appSecret: process.env.X_APP_SECRET!,
        accessToken: process.env.X_ACCESS_TOKEN!,
        accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
      });

      const compiledUserId = Handlebars.compile(safeData.data.userId)(context);
      const maxResults = Math.max(
        5,
        Math.min(100, safeData.data.maxTweets ?? 10),
      );

      const res = await userClient.v2.userTimeline(compiledUserId, {
        max_results: maxResults,
        "tweet.fields": ["created_at"],
        start_time: startTime,
        exclude: ["retweets", "replies"], // 排除转发和回复
      });

      return res.tweets[0];
    });

    // if (result.errors) {
    //   throw new NonRetriableError(
    //     `X Create Post API error: ${result.errors.map((e) => e.title).join(", ")}`,
    //   );
    // }

    await changeNodeStatusUtil("success");

    return {
      ...context,
      [safeData.data.variableName]: {
        data: result,
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
