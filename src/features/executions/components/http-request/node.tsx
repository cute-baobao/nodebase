import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { HttpRequestDialog } from "./dialog";
import { HttpRequestData, HttpRequestNodeType } from "./schema";


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

  const nodeStatus = "initial";

  const handleSubmit = useCallback(
    (values: HttpRequestData) => {
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
