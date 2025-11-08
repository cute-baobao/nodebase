import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useReactFlow } from "@xyflow/react";
import { AlignJustifyIcon } from "lucide-react";
import { memo, useCallback } from "react";
import { toast } from "sonner";
import { useFormatWorkflow } from "../hooks/use-format-workflow";

function PureFormatLayoutButton() {
  const { getNodes, getEdges, setNodes, setEdges, fitView } = useReactFlow();
  const { mutate, isPending } = useFormatWorkflow();

  const handleFormat = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();
    if (nodes.length === 0) {
      return;
    }
    mutate(
      { nodes, edges },
      {
        onSuccess: (result) => {
          console.log("格式化成功:", result);
          setNodes(result.nodes);
          setEdges(result.edges);
          fitView();
        },
        onError: (error) => {
          toast.error(`Format workflow error: ${error.message}`);
        },
      },
    );
  }, [getNodes, getEdges, setNodes, setEdges, fitView, mutate]);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={handleFormat}
          disabled={isPending}
          size="icon"
          variant="outline"
          className="bg-background"
        >
          <AlignJustifyIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-30" side="bottom" align="end">
        Format workflow Layout
      </TooltipContent>
    </Tooltip>
  );
}

export const FormatLayoutButton = memo(PureFormatLayoutButton);

FormatLayoutButton.displayName = "FormatLayoutButton";
