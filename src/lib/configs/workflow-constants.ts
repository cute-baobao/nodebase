import { EdgeWithToolbar } from "@/components/edge-with-toolbar";
import { InitialNode } from "@/components/initial-node";
import { NodeTypeValues } from "@/db";
import { DeepseekNode } from "@/features/execution-node/components/deepseek/node";
import { DiscordNode } from "@/features/execution-node/components/discord/node";
import { GeminiNode } from "@/features/execution-node/components/gemini/node";
import { HttpRequestNode } from "@/features/execution-node/components/http-request/node";
import { OpenaiNode } from "@/features/execution-node/components/openai/node";
import { ResendNode } from "@/features/execution-node/components/resend/node";
import { GoogleFormTrigger } from "@/features/triggers/components/google-form-trigger/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { StripeTrigger } from "@/features/triggers/components/stripe-trigger/node";
import { EdgeTypes, NodeTypes } from "@xyflow/react";

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
  [NodeTypeValues[9]]: ResendNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;

export const edgeTypes: EdgeTypes = {
  edgeWithToolbar: EdgeWithToolbar,
};

export type NodeStatus =
  | "loading"
  | "success"
  | "error"
  | "initial"
  | "retrying";
