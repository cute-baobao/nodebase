import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { HttpRequestDialog, HttpRequestForm } from "./dialog";

type HttpRequestNodeData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
  [key: string]: unknown;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

function PureHttpRequestNode(props: NodeProps<HttpRequestNodeType>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOnSetting = useCallback(() => {
    setDialogOpen(true);
  }, [setDialogOpen]);

  const nodeData = props.data;
  const description = nodeData.endpoint
    ? `${nodeData.method || "GET"}:${nodeData.endpoint}`
    : "Not configured";

  const nodeStatus = "loading";

  const handleSubmit = useCallback(
    (values: HttpRequestForm) => {
      setNodes((nodes) => {
        return nodes.map((node) => {
          if (node.id === props.id)
            return {
              ...node,
              data: {
                ...node.data,
                endpoint: values.endPoint,
                method: values.method,
                body: values.body,
              },
            };
          return node;
        });
      });
    },
    [setNodes],
  );

  return (
    <>
      <HttpRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultEndPoint={nodeData.endpoint}
        defaultBody={nodeData.body}
        defaultMethod={nodeData.method}
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
