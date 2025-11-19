import { useNodeStatus } from "@/features/execution-node/hooks/use-node-status";
import { CRON_TRIGGER_NAME } from "@/inngest/channels";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { TimerIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { fetchCronTriggerRealtimeToken } from "./actions";
import { CronJobDialog } from "./dialog";
import { CronJobData } from "./schema";

type CronJobNodeData = Partial<CronJobData & { [key: string]: unknown }>;

type CronJobNodeType = Node<CronJobNodeData>;

export function PureCronTriggerNode(props: NodeProps<CronJobNodeType>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const status = useMemo(() => {
    // ensure now in execution page
    if (props.data?.status && props.data.executionId)
      return props.data.status as NodeStatus;
  }, [props.data]);

  const nodeStatus = useNodeStatus({
    initialStatus: status,
    nodeId: props.id,
    channel: CRON_TRIGGER_NAME,
    topic: "status",
    refreshToken: fetchCronTriggerRealtimeToken,
  });

  const handleOpenSetting = useCallback(() => {
    setDialogOpen(true);
  }, [setDialogOpen]);

  const handleSubmit = useCallback(
    (values: CronJobNodeData) => {
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
      <CronJobDialog
        defaultValues={props.data}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />
      <BaseTriggerNode
        {...props}
        icon={TimerIcon}
        status={nodeStatus}
        name="Cron Trigger"
        description="Run a workflow on a schedule"
        onSettings={handleOpenSetting}
        onDoubleClick={handleOpenSetting}
      ></BaseTriggerNode>
    </>
  );
}

export const CronTriggerNode = memo(PureCronTriggerNode);

CronTriggerNode.displayName = "CronTriggerNode";
