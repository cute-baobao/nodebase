"use client";

import { NodeProps } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import { memo, useState } from "react";
import { NodeSelector } from "./node-selector";
import { PlaceholderNode } from "./react-flow/placeholder-node";
import { WorkflowNode } from "./workflow-node";

const PureInitialNode = (props: NodeProps) => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  return (
    <NodeSelector open={selectorOpen} onOpenChange={setSelectorOpen}>
      <WorkflowNode>
        <PlaceholderNode onClick={() => setSelectorOpen(true)} {...props}>
          <div className="flex cursor-pointer items-center justify-center">
            <PlusIcon className="size-4" />
          </div>
        </PlaceholderNode>
      </WorkflowNode>
    </NodeSelector>
  );
};

export const InitialNode = memo(PureInitialNode);

InitialNode.displayName = "InitialNode";
