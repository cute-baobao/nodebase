import { NodeExecutor } from "@/features/executions/type";
import { discordChannel } from "@/inngest/channels";
import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import ky from "ky";
import { DiscordData, discordDataSchema } from "./schema";

type DiscordNodeData = Partial<DiscordData>;

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

export const discordExecutor: NodeExecutor<DiscordNodeData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  await publish(
    discordChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  const safeData = discordDataSchema.safeParse(data);
  if (!safeData.success) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      }),
    );
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

  try {
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
    await publish(
      discordChannel().status({
        nodeId,
        status: "success",
      }),
    );
    return result;
  } catch (error) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
