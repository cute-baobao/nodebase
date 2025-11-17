import { GEMINI_CHANNEL_NAME } from "@/inngest/channels";
import { GEMINI_AVAILABLE_MODELS } from "@/lib/configs/ai-constants";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useCallback, useMemo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchGeminiRealtimeToken } from "./actions";
import { GeminiDialog } from "./dialog";
import { GeminiData } from "./schema";
import { NodeStatus } from "@/lib/configs/workflow-constants";

type GeminiNodeData = Partial<GeminiData & { [key: string]: unknown }>;

type GeminiNodeType = Node<GeminiNodeData>;

function PureGeminiNode(props: NodeProps<GeminiNodeType>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const status = useMemo(() => {
    // ensure now in execution page
    if (props.data?.status && props.data.executionId)
      return props.data.status as NodeStatus;
  }, [props.data]); 

  const handleOnSetting = useCallback(() => {
    setDialogOpen(true);
  }, [setDialogOpen]);

  const nodeData = props.data;
  const description = nodeData.userPrompt
    ? `${nodeData.model || GEMINI_AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(0, 50)}`
    : "Not configured";

  const nodeStatus = useNodeStatus({
    initialStatus: status,
    nodeId: props.id,
    channel: GEMINI_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGeminiRealtimeToken,
  });

  const handleSubmit = useCallback(
    (values: GeminiNodeData) => {
      setNodes((nodes) => {
        return nodes.map((node) => {
          if (node.id === props.id)
            return {
              ...node,
              data: {
                ...node.data,
                ...values,
              },
            };
          return node;
        });
      });
    },
    [setNodes, props.id],
  );

  return (
    <>
      <GeminiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        status={nodeStatus}
        icon="/logos/gemini.svg"
        id={props.id}
        name="Gemini"
        description={description}
        onSettings={handleOnSetting}
        onDoubleClick={handleOnSetting}
      />
    </>
  );
}

export const GeminiNode = memo(PureGeminiNode);

GeminiNode.displayName = "GeminiNode";
