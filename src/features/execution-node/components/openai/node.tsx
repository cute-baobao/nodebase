import { OPENAI_CHANNEL_NAME } from "@/inngest/channels";
import { OPENAI_AVAILABLE_MODELS } from "@/lib/configs/ai-constants";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useCallback, useMemo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchOpenaiRealtimeToken } from "./actions";
import { OpenaiDialog } from "./dialog";
import { OpenaiData } from "./schema";

type OpenaiNodeData = Partial<OpenaiData & { [key: string]: unknown }>;
type OpenaiNodeType = Node<OpenaiNodeData>;

function PureOpenaiNode(props: NodeProps<OpenaiNodeType>) {
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
    ? `${nodeData.model || OPENAI_AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(0, 50)}`
    : "Not configured";

  const nodeStatus = useNodeStatus({
    initialStatus: status,
    nodeId: props.id,
    channel: OPENAI_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchOpenaiRealtimeToken,
  });

  const handleSubmit = useCallback(
    (values: OpenaiNodeData) => {
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
      <OpenaiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        status={nodeStatus}
        icon="/logos/openai.svg"
        id={props.id}
        name="OpenAI"
        description={description}
        onSettings={handleOnSetting}
        onDoubleClick={handleOnSetting}
      />
    </>
  );
}

export const OpenaiNode = memo(PureOpenaiNode);

OpenaiNode.displayName = "OpenaiNode";
