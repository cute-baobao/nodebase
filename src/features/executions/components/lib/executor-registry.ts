import { NodeType, NodeTypeValues } from "@/db";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { NodeExecutor } from "../type";
import { httpRequestExecutor } from "../http-request/executor";

export const executeRegistry: Record<NodeType, NodeExecutor> = {
  // INITIAL
  [NodeTypeValues[0]]: manualTriggerExecutor,
  // MANUAL_TRIGGER
  [NodeTypeValues[1]]: manualTriggerExecutor,
  // HTTP_REQUEST
  [NodeTypeValues[2]]: httpRequestExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executeRegistry[type];
  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }
  return executor;
};
