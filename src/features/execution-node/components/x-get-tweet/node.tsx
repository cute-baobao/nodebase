import { X_GET_TWEET_NAME } from "@/inngest/channels";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useCallback, useMemo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchXGetTweetRealtimeToken } from "./actions";
import { XGetTweetDialog } from "./dialog";
import { XGetTweetData } from "./schema";

type XGetTweetNodeData = Partial<XGetTweetData & { [key: string]: unknown }>;
type XGetTweetNodeType = Node<XGetTweetNodeData>;

function PureXGetTweetNode(props: NodeProps<XGetTweetNodeType>) {
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
    channel: X_GET_TWEET_NAME,
    topic: "status",
    refreshToken: fetchXGetTweetRealtimeToken,
  });

  const handleSubmit = useCallback(
    (values: XGetTweetData) => {
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
      <XGetTweetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        status={nodeStatus}
        icon="/logos/x.svg"
        id={props.id}
        name="X GET Tweet"
        onSettings={handleOnSetting}
        onDoubleClick={handleOnSetting}
      />
    </>
  );
}

export const XGetTweetNode = memo(PureXGetTweetNode);

XGetTweetNode.displayName = "XGetTweetNode";
