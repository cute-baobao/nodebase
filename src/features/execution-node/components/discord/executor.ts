
import { NodeExecutor } from "@/features/executions/type";
import { discordChannel } from "@/inngest/channels";
import { updateNodeStatus } from "@/inngest/utils";
import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import ky from "ky";
import { checkNodeCanExecute } from "../../utils/check-node-can-execute";
import { DiscordData, discordDataSchema } from "./schema";
import { NodeStatus } from "@/lib/configs/workflow-constants";

type DiscordNodeData = Partial<DiscordData>;

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

export const discordExecutor: NodeExecutor<DiscordNodeData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
  executionId,
}) => {
  const channel = discordChannel();
  const changeNodeStatusUtil = async (status: NodeStatus) => {
    await step.run("update-manual-trigger-node-status", async () => {
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

    const safeData = discordDataSchema.safeParse(data);
    if (!safeData.success) {
      await changeNodeStatusUtil("error");
      throw new NonRetriableError(
        `Invalid data for DISCORD node : ${safeData.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    const rawContent = Handlebars.compile(safeData.data.content)(context);
    const content = decode(rawContent);
    const username = safeData.data.username
      ? decode(Handlebars.compile(safeData.data.username)(context))
      : undefined;
    const webhookUrl = Handlebars.compile(safeData.data.webhookUrl)(context);

    const result = await step.run("discord-webhook", async () => {
      await ky.post(webhookUrl, {
        json: {
          content: content.slice(0, 2000),
          username,
        },
      });

      return {
        ...context,
        [safeData.data.variableName]: {
          discordMessage: true,
        },
      };
    });
    await changeNodeStatusUtil("success");
    return result;
  } catch (error) {
    await changeNodeStatusUtil("error");
    throw error;
  }
};
