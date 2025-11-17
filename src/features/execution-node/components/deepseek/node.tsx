import { DEEPSEEK_CHANNEL_NAME } from "@/inngest/channels";
import { DEEPSEEK_AVAILABLE_MODELS } from "@/lib/configs/ai-constants";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useCallback, useMemo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchDeepseekRealtimeToken } from "./actions";
import { DeepseekDialog } from "./dialog";
import { DeepseekData } from "./schema";

type DeepseekNodeData = Partial<DeepseekData & { [key: string]: unknown }>;
type DeepseekNodeType = Node<DeepseekNodeData>;

function PureDeepseekNode(props: NodeProps<DeepseekNodeType>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const status = useMemo(() => {
    // ensure now in execution page
    if (props.data?.status && props.data.executionId)
      return props.data.status as NodeStatus;
  }, [props.data]);

  const nodeData = props.data;
  const description = nodeData.userPrompt
    ? `${nodeData.model || DEEPSEEK_AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(0, 50)}`
    : "Not configured";

  const nodeStatus = useNodeStatus({
    initialStatus: status,
    nodeId: props.id,
    channel: DEEPSEEK_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchDeepseekRealtimeToken,
  });

  const handleSubmit = useCallback(
    (values: DeepseekNodeData) => {
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

  const handleOnSetting = useCallback(() => {
    setDialogOpen(true);
  }, [setDialogOpen]);

  return (
    <>
      <DeepseekDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        status={nodeStatus}
        icon="/logos/deepseek.svg"
        id={props.id}
        name="Deepseek"
        description={description}
        onSettings={handleOnSetting}
        onDoubleClick={handleOnSetting}
      />
    </>
  );
}

export const DeepseekNode = memo(PureDeepseekNode);

DeepseekNode.displayName = "DeepseekNode";
