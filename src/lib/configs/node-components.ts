import { InitialNode } from "@/components/initial-node";
import { NodeTypeValues } from "@/db";
import { HttpRequestNode } from "@/features/executions/components/http-request/node";
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
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
