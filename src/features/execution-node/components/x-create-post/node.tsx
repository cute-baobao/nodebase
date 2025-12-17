import { X_CREATE_POST_NAME } from "@/inngest/channels";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useCallback, useMemo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchXCreatePostRealtimeToken } from "./actions";
import { XCreatePostDialog } from "./dialog";
import { XCreatePostData } from "./schema";

type XCreatePostNodeData = Partial<
  XCreatePostData & { [key: string]: unknown }
>;
type XCreatePostNodeType = Node<XCreatePostNodeData>;

function PureXCreatePostNode(props: NodeProps<XCreatePostNodeType>) {
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
    channel: X_CREATE_POST_NAME,
    topic: "status",
    refreshToken: fetchXCreatePostRealtimeToken,
  });

  const handleSubmit = useCallback(
    (values: XCreatePostNodeData) => {
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
      <XCreatePostDialog
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
        name="X Create Post"
        onSettings={handleOnSetting}
        onDoubleClick={handleOnSetting}
      />
    </>
  );
}

export const XCreatePostNode = memo(PureXCreatePostNode);

XCreatePostNode.displayName = "XCreatePostNode";
