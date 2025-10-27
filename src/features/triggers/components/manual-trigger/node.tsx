import { NodeProps } from "@xyflow/react";
import { MousePointerIcon } from "lucide-react";
import { memo } from "react";
import { BaseTriggerNode } from "../base-trigger-node";

export function PureManualTriggerNode(props: NodeProps) {
  return (
    <>
      <BaseTriggerNode
        {...props}
        icon={MousePointerIcon}
        name="When clicking 'Execute workflow'"
        onSettings={() => {}}
        onDoubleClick={() => {}}
      ></BaseTriggerNode>
    </>
  );
}

export const ManualTriggerNode = memo(PureManualTriggerNode);

ManualTriggerNode.displayName = "ManualTriggerNode";
