import { NodeProps } from "@xyflow/react";
import { MousePointerIcon } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { ManualTirggerDialog } from "./dialog";

export function PureManualTriggerNode(props: NodeProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeStatus = "loading";

  const handleOpenSetting = useCallback(() => {
    setDialogOpen(true);
  }, [setDialogOpen]);

  return (
    <>
      <ManualTirggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon={MousePointerIcon}
        status={nodeStatus}
        name="When clicking 'Execute workflow'"
        onSettings={handleOpenSetting}
        onDoubleClick={handleOpenSetting}
      ></BaseTriggerNode>
    </>
  );
}

export const ManualTriggerNode = memo(PureManualTriggerNode);

ManualTriggerNode.displayName = "ManualTriggerNode";
