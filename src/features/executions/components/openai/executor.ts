import { NodeExecutor } from "@/features/executions/type";
import { openaiChannel } from "@/inngest/channels";
import { OPENAI_AVAILABLE_MODELS } from "@/lib/configs/ai-constants";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { OpenaiData, openaiDataSchema } from "./schema";

type OpenaiNodeData = Partial<OpenaiData>;

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

export const openaiExecutor: NodeExecutor<OpenaiNodeData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    openaiChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  const safeData = openaiDataSchema.safeParse(data);
  if (!safeData.success) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `Invalid data for Openai node : ${safeData.error.issues.map((i) => i.message).join(", ")}`,
    );
  }

  const systemPrompt = safeData.data.systemPrompt
    ? Handlebars.compile(safeData.data.systemPrompt)(context)
    : "You are a helpful assistant.";
  const userPrompt = Handlebars.compile(safeData.data.userPrompt)(context);
  // TODO: Fetch credentials from user selected
  const credentialValue = process.env.OPENAI_API_KEY!;
  const openai = createOpenAI({
    apiKey: credentialValue,
  });

  try {
    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openai(safeData.data.model || OPENAI_AVAILABLE_MODELS[0] || ""),
      system: systemPrompt,
      prompt: userPrompt,
    });

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";
    await publish(
      openaiChannel().status({
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
      openaiChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
