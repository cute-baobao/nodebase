import { NodeStatus } from "@/lib/configs/workflow-constants";
import { Realtime } from "@inngest/realtime";
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { useEffect, useState } from "react";

interface UseNodeStatusOptions {
  initialStatus?: NodeStatus;
  nodeId: string;
  channel: string;
  topic: string;
  refreshToken: () => Promise<Realtime.Subscribe.Token>;
}

export function useNodeStatus({
  initialStatus = "initial",
  nodeId,
  channel,
  topic,
  refreshToken,
}: UseNodeStatusOptions) {
  const [status, setStatus] = useState<NodeStatus>(initialStatus);
  const { data } = useInngestSubscription({
    refreshToken,
    enabled: true,
  });

  useEffect(() => {
    if (!data.length) return;
    const lastMessage = data
      .filter(
        (msg) =>
          msg.channel === channel &&
          msg.topic === topic &&
          msg.kind === "data" &&
          msg.data.nodeId === nodeId,
      )
      .sort((a, b) => {
        if (a.kind === "data" && b.kind === "data") {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return 0;
      })
      .shift();
    if (lastMessage?.kind === "data") {
      setStatus(lastMessage.data.status as NodeStatus);
    }
  }, [data, channel, topic, nodeId]);

  return status;
}
