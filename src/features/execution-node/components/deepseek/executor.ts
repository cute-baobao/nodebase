import db from "@/db/instance";
import { NodeExecutor } from "@/features/executions/type";
import { deepseekChannel } from "@/inngest/channels";
import { updateNodeStatus } from "@/inngest/utils";
import { DEEPSEEK_AVAILABLE_MODELS } from "@/lib/configs/ai-constants";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { decrypt } from "@/lib/utils/encryption";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";
import { and, eq } from "drizzle-orm";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { checkNodeCanExecute } from "../../utils/check-node-can-execute";
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
  userId,
  publish,
  executionId,
}) => {
  const channel = deepseekChannel();
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

    const safeData = deepseekDataSchema.safeParse(data);
    if (!safeData.success) {
      await changeNodeStatusUtil("error");
      throw new NonRetriableError(
        `Invalid data for Deepseek node : ${safeData.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    const systemPrompt = safeData.data.systemPrompt
      ? Handlebars.compile(safeData.data.systemPrompt)(context)
      : "You are a helpful assistant.";
    const userPrompt = Handlebars.compile(safeData.data.userPrompt)(context);
    const credential = await step.run("get-deepseek-credential", () => {
      return db.query.credential.findFirst({
        where: (c) =>
          and(eq(c.id, safeData.data.credentialId), eq(c.userId, userId)),
      });
    });

    if (!credential) {
      await changeNodeStatusUtil("error");
      throw new NonRetriableError("Deepseek credential not found");
    }

    const credentialValue = decrypt(credential.value);
    const deepseek = createDeepSeek({
      apiKey: credentialValue,
    });

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
    if (error instanceof NonRetriableError) {
      await changeNodeStatusUtil("error");
    } else {
      await changeNodeStatusUtil("retring");
    }
    throw error;
  }
};
