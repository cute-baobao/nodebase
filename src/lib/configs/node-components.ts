import { InitialNode } from "@/components/initial-node";
import { NodeTypeValues } from "@/db";
import { DeepseekNode } from "@/features/executions/components/deepseek/node";
import { DiscordNode } from "@/features/executions/components/discord/node";
import { GeminiNode } from "@/features/executions/components/gemini/node";
import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { OpenaiNode } from "@/features/executions/components/openai/node";
import { GoogleFormTrigger } from "@/features/triggers/components/google-form-trigger/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { StripeTrigger } from "@/features/triggers/components/stripe-trigger/node";
import { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
  [NodeTypeValues[0]]: InitialNode,
  [NodeTypeValues[1]]: ManualTriggerNode,
  [NodeTypeValues[2]]: HttpRequestNode,
  [NodeTypeValues[3]]: GoogleFormTrigger,
  [NodeTypeValues[4]]: StripeTrigger,
  [NodeTypeValues[5]]: OpenaiNode,
  [NodeTypeValues[6]]: GeminiNode,
  [NodeTypeValues[7]]: DeepseekNode,
  [NodeTypeValues[8]]: DiscordNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
