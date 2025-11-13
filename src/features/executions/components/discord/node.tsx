import { DISCORD_CHANNEL_NAME } from "@/inngest/channels";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useCallback, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchDiscordRealtimeToken } from "./actions";
import { DiscordDialog } from "./dialog";
import { DiscordData } from "./schema";

type DiscordNodeData = Partial<DiscordData>;

type DiscordNodeType = Node<DiscordNodeData>;

function PureDiscordNode(props: NodeProps<DiscordNodeType>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleOnSetting = useCallback(() => {
    setDialogOpen(true);
  }, [setDialogOpen]);

  const nodeData = props.data;
  const description = nodeData.content
    ? `Send: ${nodeData.content.slice(0, 50)}`
    : "Not configured";

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: DISCORD_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchDiscordRealtimeToken,
  });

  const handleSubmit = useCallback(
    (values: DiscordNodeData) => {
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
      <DiscordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        status={nodeStatus}
        icon="/logos/discord.svg"
        id={props.id}
        name="Discord"
        description={description}
        onSettings={handleOnSetting}
        onDoubleClick={handleOnSetting}
      />
    </>
  );
}

export const DiscordNode = memo(PureDiscordNode);

DiscordNode.displayName = "DiscordNode";
