import { RESEND_CHANNEL_NAME } from "@/inngest/channels";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useCallback, useMemo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchResendRealtimeToken } from "./actions";
import { ResendDialog } from "./dialog";
import { ResendData } from "./schema";

type ResendNodeData = Partial<ResendData & { [key: string]: unknown }>;
type ResendNodeType = Node<ResendNodeData>;

function PureResendNode(props: NodeProps<ResendNodeType>) {
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

  const nodeStatus = useNodeStatus({
    initialStatus: status,
    nodeId: props.id,
    channel: RESEND_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchResendRealtimeToken,
  });

  const handleSubmit = useCallback(
    (values: ResendNodeData) => {
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
      <ResendDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        status={nodeStatus}
        icon="/logos/resend.svg"
        id={props.id}
        name="Resend"
        onSettings={handleOnSetting}
        onDoubleClick={handleOnSetting}
      />
    </>
  );
}

export const ResendNode = memo(PureResendNode);

ResendNode.displayName = "ResendNode";
