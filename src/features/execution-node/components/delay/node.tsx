import { DELAY_NAME } from "@/inngest/channels";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useCallback, useMemo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchDelayRealtimeToken } from "./actions";
import { DelayDialog } from "./dialog";
import { DelayData } from "./schema";

type DelayNodeData = Partial<DelayData & { [key: string]: unknown }>;
type DelayNodeType = Node<DelayNodeData>;

function PureDelayNode(props: NodeProps<DelayNodeType>) {
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
  const duration = nodeData?.duration;

  const nodeStatus = useNodeStatus({
    initialStatus: status,
    nodeId: props.id,
    channel: DELAY_NAME,
    topic: "status",
    refreshToken: fetchDelayRealtimeToken,
  });

  const handleSubmit = useCallback(
    (values: DelayNodeData) => {
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

  const description = useMemo(() => {
    if (typeof duration === "number")
      return `Delays the workflow for ${duration} ms.`;
    else return "not configured yet.";
  }, [duration]);

  return (
    <>
      <DelayDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        status={nodeStatus}
        icon="/logos/delay.svg"
        id={props.id}
        name="Delay"
        description={description}
        onSettings={handleOnSetting}
        onDoubleClick={handleOnSetting}
      />
    </>
  );
}

export const DelayNode = memo(PureDelayNode);

DelayNode.displayName = "DelayNode";
