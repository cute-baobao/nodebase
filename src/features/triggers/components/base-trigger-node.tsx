"use client";

import { BaseHandle } from "@/components/react-flow/base-handle";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { NodeStatusIndicator } from "@/components/react-flow/node-status-indicator";
import { WorkflowNode } from "@/components/workflow-node";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { NodeProps, Position, useReactFlow } from "@xyflow/react";
import { LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo } from "react";

interface BaseTriggerNodeProps extends NodeProps {
  icon: LucideIcon | string;
  name: string;
  description?: string;
  status?: NodeStatus;
  children?: React.ReactNode;
  onSettings?: () => void;
  onDoubleClick?: () => void;
}

export function PureBaseTriggerNode({
  id,
  icon: Icon,
  name,
  description,
  children,
  status = "initial",
  onSettings,
  onDoubleClick,
}: BaseTriggerNodeProps) {
  const { setNodes, setEdges } = useReactFlow();

  const handleDelete = () => {
    setNodes((currentNode) => {
      const updateNode = currentNode.filter((node) => node.id !== id);
      return updateNode;
    });

    setEdges((currentEdge) => {
      const updateEdge = currentEdge.filter(
        (edge) => edge.source !== id && edge.target !== id,
      );
      return updateEdge;
    });
  };

  return (
    <WorkflowNode
      name={name}
      description={description}
      onSetting={onSettings}
      onDelete={handleDelete}
    >
      <NodeStatusIndicator
        status={status}
        variant="border"
        className="rounded-l-2xl"
      >
        <BaseNode
          status={status}
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
      </NodeStatusIndicator>
    </WorkflowNode>
  );
}

export const BaseTriggerNode = memo(PureBaseTriggerNode);

BaseTriggerNode.displayName = "BaseTriggerNode";
