import { NodeType, NodeTypeValues } from "@/db";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { deepseekExecutor } from "../components/deepseek/executor";
import { geminiExecutor } from "../components/gemini/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { openaiExecutor } from "../components/openai/executor";
import { NodeExecutor } from "../type";

export const executeRegistry: Record<NodeType, NodeExecutor> = {
  // INITIAL
  [NodeTypeValues[0]]: manualTriggerExecutor,
  // MANUAL_TRIGGER
  [NodeTypeValues[1]]: manualTriggerExecutor,
  // HTTP_REQUEST
  [NodeTypeValues[2]]: httpRequestExecutor,
  // GOOGLE_FORM_TRIGGER
  [NodeTypeValues[3]]: googleFormTriggerExecutor,
  // STRIPE_TRIGGER
  [NodeTypeValues[4]]: stripeTriggerExecutor,
  // OPENAI
  [NodeTypeValues[5]]: openaiExecutor,
  // GEMINI
  [NodeTypeValues[6]]: geminiExecutor,
  // DEEPSEEK
  [NodeTypeValues[7]]: deepseekExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executeRegistry[type];
  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }
  return executor;
};
