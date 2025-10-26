"use client";

import { NodeProps } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import { memo } from "react";
import { PlaceholderNode } from "./react-flow/placeholder-node";
import { WorkflowNode } from "./workflow-node";

const PureInitialNode = (props: NodeProps) => {
  return (
    <WorkflowNode>
      <PlaceholderNode {...props}>
        <div className="flex cursor-pointer items-center justify-center">
          <PlusIcon className="size-4" />
        </div>
      </PlaceholderNode>
    </WorkflowNode>
  );
};

export const InitialNode = memo(PureInitialNode);

InitialNode.displayName = "InitialNode";
