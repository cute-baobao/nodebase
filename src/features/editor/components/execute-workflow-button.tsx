import { Button } from "@/components/ui/button";
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";
import { FlaskConicalIcon } from "lucide-react";

export function ExecuteWorkflowButton({ workflowId }: { workflowId: string }) {
  const executeWorkflow = useExecuteWorkflow();

  const handleExecute = () => {
    executeWorkflow.mutate({ id: workflowId });
  };

  return (
    <Button
      size="lg"
      disabled={executeWorkflow.isPending}
      onClick={handleExecute}
    >
      <FlaskConicalIcon className="size-4" />
      Execute Workflow
    </Button>
  );
}
