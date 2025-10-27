"use client";

import { BaseHandle } from "@/components/react-flow/base-handle";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { WorkflowNode } from "@/components/workflow-node";
import { NodeProps, Position } from "@xyflow/react";
import { LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo } from "react";

interface BaseTriggerNodeProps extends NodeProps {
  icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: React.ReactNode;
  onSettings?: () => void;
  onDoubleClick?: () => void;
}

export function PureBaseTriggerNode({
  icon: Icon,
  name,
  description,
  children,
  onSettings,
  onDoubleClick,
}: BaseTriggerNodeProps) {
  return (
    <WorkflowNode
      name={name}
      description={description}
      onSetting={onSettings}
      onDelete={() => {
        console.log("Delete");
      }}
    >
      <BaseNode
        onDoubleClick={onDoubleClick}
        className="group relative rounded-l-2xl"
      >
        <BaseNodeContent>
          {typeof Icon === "string" ? (
            <Image src={Icon} alt={name} width={16} height={16} />
          ) : (
            <Icon className="text-muted-foreground size-4" />
          )}
          {children}
          <BaseHandle id="source-1" type="source" position={Position.Right} />
        </BaseNodeContent>
      </BaseNode>
    </WorkflowNode>
  );
}

export const BaseTriggerNode = memo(PureBaseTriggerNode);

BaseTriggerNode.displayName = "BaseTriggerNode";
