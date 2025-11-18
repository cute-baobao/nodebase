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

interface BaseExecutionNodeProps extends NodeProps {
  icon: LucideIcon | string;
  name: string;
  description?: string;
  status?: NodeStatus;
  children?: React.ReactNode;
  onSettings?: () => void;
  onDoubleClick?: () => void;
}

export function PureBaseExecutionNode({
  id,
  icon: Icon,
  name,
  status = "initial",
  description,
  children,
  onSettings,
  onDoubleClick,
}: BaseExecutionNodeProps) {
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
      <NodeStatusIndicator status={status} variant="border">
        <BaseNode status={status} onDoubleClick={onDoubleClick}>
          <BaseNodeContent>
            {typeof Icon === "string" ? (
              <Image src={Icon} alt={name} width={16} height={16} />
            ) : (
              <Icon className="text-muted-foreground size-4" />
            )}
            {children}
            <BaseHandle id="target-1" type="target" position={Position.Left} />
            <BaseHandle id="source-1" type="source" position={Position.Right} />
          </BaseNodeContent>
        </BaseNode>
      </NodeStatusIndicator>
    </WorkflowNode>
  );
}

export const BaseExecutionNode = memo(PureBaseExecutionNode);

BaseExecutionNode.displayName = "BaseExecutionNode";
