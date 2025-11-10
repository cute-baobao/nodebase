import { NodeProps } from "@xyflow/react";
import { memo, useCallback, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { GoogleFormTriggerDialog } from "./dialog";

export function PureGoogleFormTrigger(props: NodeProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeStatus = "initial";
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

GoogleFormTrigger.displayName = "ManualTriggerNode";
