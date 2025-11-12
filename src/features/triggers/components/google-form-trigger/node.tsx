import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { GOOGLE_FORM_TRIGGER_CHANNEL_NAME } from "@/inngest/channels";
import { NodeProps } from "@xyflow/react";
import { memo, useCallback, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { fetchGoogleFormTriggerRealtimeToken } from "./actions";
import { GoogleFormTriggerDialog } from "./dialog";

export function PureGoogleFormTrigger(props: NodeProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GOOGLE_FORM_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGoogleFormTriggerRealtimeToken,
  });
  const handleOpenSetting = useCallback(() => {
    setDialogOpen(true);
  }, [setDialogOpen]);

  return (
    <>
      <GoogleFormTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon={"/logos/google-form.svg"}
        status={nodeStatus}
        name="Google Form"
        description="When form is submitted"
        onSettings={handleOpenSetting}
        onDoubleClick={handleOpenSetting}
      ></BaseTriggerNode>
    </>
  );
}

export const GoogleFormTrigger = memo(PureGoogleFormTrigger);

GoogleFormTrigger.displayName = "GoogleFormTriggerNode";
