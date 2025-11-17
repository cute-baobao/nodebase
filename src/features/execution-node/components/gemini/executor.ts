import db from "@/db/instance";
import { NodeExecutor } from "@/features/executions/type";
import { geminiChannel } from "@/inngest/channels";
import { updateNodeStatus } from "@/inngest/utils";
import { GEMINI_AVAILABLE_MODELS } from "@/lib/configs/ai-constants";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { decrypt } from "@/lib/utils/encryption";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { and, eq } from "drizzle-orm";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { checkNodeCanExecute } from "../../utils/check-node-can-execute";
import { GeminiData, geminiDataSchema } from "./schema";

type GeminiNodeData = Partial<GeminiData>;

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

export const geminiExecutor: NodeExecutor<GeminiNodeData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
  executionId,
}) => {
  const channel = geminiChannel();
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

    const safeData = geminiDataSchema.safeParse(data);
    if (!safeData.success) {
      await changeNodeStatusUtil("error");
      throw new NonRetriableError(
        `Invalid data for GEMINI node : ${safeData.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    const systemPrompt = safeData.data.systemPrompt
      ? Handlebars.compile(safeData.data.systemPrompt)(context)
      : "You are a helpful assistant.";
    const userPrompt = Handlebars.compile(safeData.data.userPrompt)(context);
    const credential = await step.run("get-gemini-credential", () => {
      return db.query.credential.findFirst({
        where: (c) =>
          and(eq(c.id, safeData.data.credentialId), eq(c.userId, userId)),
      });
    });

    if (!credential) {
      await changeNodeStatusUtil("error");
      throw new NonRetriableError("GEMINI credential not found");
    }

    const credentialValue = decrypt(credential.value);
    const google = createGoogleGenerativeAI({
      apiKey: credentialValue,
    });
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google(safeData.data.model || GEMINI_AVAILABLE_MODELS[0]),
      system: systemPrompt,
      prompt: userPrompt,
    });

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";
    await changeNodeStatusUtil("success");
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
    await changeNodeStatusUtil("error");
    throw error;
  }
};
