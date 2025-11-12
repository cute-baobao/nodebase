import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { STRIPE_TRIGGER_CHANNEL_NAME } from "@/inngest/channels";
import { NodeProps } from "@xyflow/react";
import { memo, useCallback, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { fetchStripeTriggerRealtimeToken } from "./actions";
import { StripeTriggerDialog } from "./dialog";

export function PureStripeTrigger(props: NodeProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: STRIPE_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchStripeTriggerRealtimeToken,
  });
  const handleOpenSetting = useCallback(() => {
    setDialogOpen(true);
  }, [setDialogOpen]);

  return (
    <>
      <StripeTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon={"/logos/stripe.svg"}
        status={nodeStatus}
        name="Stripe"
        description="When Stripe event is captured"
        onSettings={handleOpenSetting}
        onDoubleClick={handleOpenSetting}
      ></BaseTriggerNode>
    </>
  );
}

export const StripeTrigger = memo(PureStripeTrigger);

StripeTrigger.displayName = "StripeTriggerNode";
