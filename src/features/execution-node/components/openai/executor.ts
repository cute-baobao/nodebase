import db from "@/db/instance";
import { NodeExecutor } from "@/features/executions/type";
import { openaiChannel } from "@/inngest/channels";
import { OPENAI_AVAILABLE_MODELS } from "@/lib/configs/ai-constants";
import { decrypt } from "@/lib/utils/encryption";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { and, eq } from "drizzle-orm";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { checkNodeCanExecute } from "../../utils/check-node-can-execute";
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
  userId,
  publish,
}) => {
  try {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "loading",
      }),
    );

    await checkNodeCanExecute(nodeId);

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
    const credential = await step.run("get-openai-credential", () => {
      return db.query.credential.findFirst({
        where: (c) =>
          and(eq(c.id, safeData.data.credentialId), eq(c.userId, userId)),
      });
    });

    if (!credential) {
      await publish(
        openaiChannel().status({
          nodeId,
          status: "error",
        }),
      );
      throw new NonRetriableError("Openai credential not found");
    }

    const credentialValue = decrypt(credential.value);
    const openai = createOpenAI({
      apiKey: credentialValue,
    });

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
