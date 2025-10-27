import { Node, NodeProps } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo } from "react";
import { BaseExecutionNode } from "../base-execution-node";

type HttpRequestNodeData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
  [key: string]: unknown;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

function PureHttpRequestNode(props: NodeProps<HttpRequestNodeType>) {
  const nodeData = props.data;
  const description = nodeData.endpoint
    ? `${nodeData.method || "GET"}:${nodeData.endpoint}`
    : "Not configured";
  return (
    <>
      <BaseExecutionNode
        {...props}
        icon={GlobeIcon}
        id={props.id}
        name="HTTP Request"
        description={description}
        onSettings={() => {}}
        onDoubleClick={() => {}}
      />
    </>
  );
}

export const HttpRequestNode = memo(PureHttpRequestNode);

HttpRequestNode.displayName = "HttpRequestNode";
