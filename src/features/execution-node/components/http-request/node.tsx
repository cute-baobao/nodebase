import { HTTP_REQUEST_CHANNEL_NAME } from "@/inngest/channels/http-request";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchHttpRequestRealtimeToken } from "./actions";
import { HttpRequestDialog } from "./dialog";
import { HttpRequestData } from "./schema";

type HttpRequestNodeData = Partial<
  HttpRequestData & { [key: string]: unknown }
>;

type HttpRequestNodeType = Node<HttpRequestNodeData>;

function PureHttpRequestNode(props: NodeProps<HttpRequestNodeType>) {
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
  const description = nodeData.endpoint
    ? `${nodeData.method || "GET"}:${nodeData.endpoint}`
    : "Not configured";

  const nodeStatus = useNodeStatus({
    initialStatus: status,
    nodeId: props.id,
    channel: HTTP_REQUEST_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchHttpRequestRealtimeToken,
  });

  const handleSubmit = useCallback(
    (values: HttpRequestNodeData) => {
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
      <HttpRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        status={nodeStatus}
        icon={GlobeIcon}
        id={props.id}
        name="HTTP Request"
        description={description}
        onSettings={handleOnSetting}
        onDoubleClick={handleOnSetting}
      />
    </>
  );
}

export const HttpRequestNode = memo(PureHttpRequestNode);

HttpRequestNode.displayName = "HttpRequestNode";
