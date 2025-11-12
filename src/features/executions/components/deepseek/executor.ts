import { NodeExecutor } from "@/features/executions/type";
import { deepseekChannel } from "@/inngest/channels";
import { DEEPSEEK_AVAILABLE_MODELS } from "@/lib/configs/ai-constants";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { DeepseekData, deepseekDataSchema } from "./schema";

type DeepseekNodeData = Partial<DeepseekData>;

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

export const deepseekExecutor: NodeExecutor<DeepseekNodeData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    deepseekChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  const safeData = deepseekDataSchema.safeParse(data);
  if (!safeData.success) {
    await publish(
      deepseekChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `Invalid data for Deepseek node : ${safeData.error.issues.map((i) => i.message).join(", ")}`,
    );
  }

  const systemPrompt = safeData.data.systemPrompt
    ? Handlebars.compile(safeData.data.systemPrompt)(context)
    : "You are a helpful assistant.";
  const userPrompt = Handlebars.compile(safeData.data.userPrompt)(context);
  // TODO: Fetch credentials from user selected
  const credentialValue = process.env.DEEPSEEK_API_KEY!;
  const deepseek = createDeepSeek({
    apiKey: credentialValue,
  });

  try {
    const { steps } = await step.ai.wrap(
      "deepseek-generate-text",
      generateText,
      {
        model: deepseek(safeData.data.model || DEEPSEEK_AVAILABLE_MODELS[0]),
        system: systemPrompt,
        prompt: userPrompt,
      },
    );

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";
    await publish(
      deepseekChannel().status({
        nodeId,
        status: "success",
      }),
    );
    return {
      ...context,
      [safeData.data.variableName]: {
        aiResponse: {
          text,
        },
        usage: steps[0].usage,
      },
    };
  } catch (error) {
    await publish(
      deepseekChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
