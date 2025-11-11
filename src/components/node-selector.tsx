import { NodeType, NodeTypeValues } from "@/db";
import { useReactFlow } from "@xyflow/react";
import { GlobeIcon, MousePointerIcon } from "lucide-react";
import Image from "next/image";
import React, { useCallback } from "react";
import { toast } from "sonner";
import { v4 as createID } from "uuid";
import { Separator } from "./ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

export type NodeTypeOption = {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | string;
};

const triggerNodeTypes: NodeTypeOption[] = [
  {
    type: NodeTypeValues[1],
    label: "Trigger manually",
    description:
      "Runs the workflow on clicking a button. Good for getting started quickly.",
    icon: MousePointerIcon,
  },
  {
    type: NodeTypeValues[3],
    label: "Google Form",
    description: "Runs the workflow when a Google Form is submitted.",
    icon: "/logos/google-form.svg",
  },
  {
    type: NodeTypeValues[4],
    label: "Stripe Event",
    description: "Runs the workflow when a Stripe event is captured.",
    icon: "/logos/stripe.svg",
  },
];

const executionNodes: NodeTypeOption[] = [
  {
    type: NodeTypeValues[2],
    label: "HTTP Request",
    description: "Makes an HTTP request",
    icon: GlobeIcon,
  },
  {
    type: NodeTypeValues[6],
    label: "Gemini",
    description: "Use Google Gemini to generate text",
    icon: "/logos/gemini.svg",
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function NodeSelector({
  open,
  onOpenChange,
  children,
}: NodeSelectorProps) {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
  const handleNodeSelect = useCallback(
    (selection: NodeTypeOption) => {
      if (selection.type === NodeTypeValues[1]) {
        const nodes = getNodes();
        const hadManualTrigger = nodes.some(
          (node) => node.type === NodeTypeValues[1],
        );
        if (hadManualTrigger) {
          toast.error("Only one manual trigger node is allowed per workflow.");
          return;
        }
      }

      setNodes((nodes) => {
        const hasInitialTrigger = nodes.some(
          (node) => node.type === NodeTypeValues[0],
        );

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const flowPosition = screenToFlowPosition({
          x: centerX + (Math.random() - 0.5) * 200,
          y: centerY + (Math.random() - 0.5) * 200,
        });

        const newNode = {
          id: createID(),
          data: {},
          position: flowPosition,
          type: selection.type,
        };

        if (hasInitialTrigger) {
          return [newNode];
        }

        return [...nodes, newNode];
      });

      onOpenChange(false);
    },
    [onOpenChange, getNodes, screenToFlowPosition, setNodes],
  );
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>What triggers this workflow?</SheetTitle>
          <SheetDescription>
            A trigger is a step that starts your workflow.
          </SheetDescription>
        </SheetHeader>
        <div>
          {triggerNodeTypes.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.type}
                className="hover:border-l-primary h-auto w-full cursor-pointer justify-start rounded-none border-l-2 border-t-transparent px-4 py-5"
                onClick={() => handleNodeSelect(node)}
              >
                <div className="flex w-full items-center gap-6 overflow-hidden">
                  {typeof Icon === "string" ? (
                    <Image
                      src={Icon}
                      alt={node.label}
                      width={20}
                      height={20}
                      objectFit="contain"
                      className="rounded-sm"
                    />
                  ) : (
                    <Icon className="size-5 rounded-sm object-contain" />
                  )}
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{node.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {node.description}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Separator />
        <div>
          {executionNodes.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.type}
                className="hover:border-l-primary h-auto w-full cursor-pointer justify-start rounded-none border-l-2 border-t-transparent px-4 py-5"
                onClick={() => handleNodeSelect(node)}
              >
                <div className="flex w-full items-center gap-6 overflow-hidden">
                  {typeof Icon === "string" ? (
                    <Image
                      src={Icon}
                      alt={node.label}
                      width={20}
                      height={20}
                      objectFit="contain"
                      className="rounded-sm"
                    />
                  ) : (
                    <Icon className="size-5 rounded-sm object-contain" />
                  )}
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{node.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {node.description}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
