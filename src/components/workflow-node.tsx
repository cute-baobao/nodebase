import { NodeToolbar, Position } from "@xyflow/react";
import { SettingsIcon, TrashIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface WorkflowNodeProps {
  children?: React.ReactNode;
  showToolbar?: boolean;
  onDelete?: () => void;
  onSetting?: () => void;
  name?: string;
  description?: string;
}

export function WorkflowNode({
  children,
  showToolbar = true,
  onDelete,
  onSetting,
  name,
  description,
}: WorkflowNodeProps) {
  return (
    <>
      {showToolbar && (
        <NodeToolbar>
          <Button size="sm" variant="ghost" onClick={onSetting}>
            <SettingsIcon className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <TrashIcon className="size-4" />
          </Button>
        </NodeToolbar>
      )}
      {children}
      {name && (
        <NodeToolbar
          position={Position.Bottom}
          isVisible
          className="max-w-[200px] text-center"
        >
          <p className="font-medium">{name}</p>
          {description && (
            <Tooltip>
              <TooltipTrigger>
                <p className="text-muted-foreground max-w-2xs text-sm wrap-break-word">
                  {description}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{description}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </NodeToolbar>
      )}
    </>
  );
}
