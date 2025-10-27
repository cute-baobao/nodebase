import { InitialNode } from "@/components/initial-node";
import { NodeTypeValues } from "@/db";
import { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
  [NodeTypeValues[0]]: InitialNode,
  [NodeTypeValues[1]]: InitialNode,
  [NodeTypeValues[2]]: InitialNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
