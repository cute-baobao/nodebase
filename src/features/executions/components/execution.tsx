"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  calculateDuration,
  formatStatus,
  getStatusIcon,
} from "@/lib/configs/execution-constants";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { useSuspenseSingleExecution } from "../hooks/use-executions";
import WorkflowExecution from "./workflow-execution";

export const ExecutionView = ({ executionId }: { executionId: string }) => {
  const { data: execution } = useSuspenseSingleExecution(executionId);
  const [showStackTrace, setShowStackTrace] = useState(false);
  const duration = calculateDuration(
    execution.startedAt,
    execution.completedAt,
  );

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-none">
        <CardHeader>
          <div className="flex items-center gap-3">
            {getStatusIcon(execution.status)}
            <div>
              <CardTitle>{formatStatus(execution.status)}</CardTitle>
              <CardDescription>
                Execution for {execution.workflow.name}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Workflow
              </p>
              <Link
                prefetch
                className="text-primary text-sm hover:underline"
                href={`/workflows/${execution.workflow.id}`}
              >
                {execution.workflow.name}
              </Link>
            </div>

            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Status
              </p>
              <p className="text-sm">{formatStatus(execution.status)}</p>
            </div>

            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Started
              </p>
              <p className="text-sm">
                {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
              </p>
            </div>

            {execution.completedAt ? (
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Completed
                </p>
                <p className="text-sm">
                  {formatDistanceToNow(execution.completedAt, {
                    addSuffix: true,
                  })}
                </p>
              </div>
            ) : null}

            {duration ? (
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Duration
                </p>
                <p className="text-sm">{duration}s</p>
              </div>
            ) : null}
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Event ID
              </p>
              <p className="text-sm">{execution.inngestEventId}</p>
            </div>
          </div>
          {execution.error && (
            <div className="mt-6 space-y-3 rounded-md bg-red-50 p-4">
              <div>
                <p className="mb-2 text-sm font-medium text-red-900">Error</p>
                <p className="font-mono text-sm text-red-800">
                  {execution.error}
                </p>
              </div>
              {execution.errorStack && (
                <Collapsible
                  open={showStackTrace}
                  onOpenChange={setShowStackTrace}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-900 hover:bg-red-100"
                    >
                      {showStackTrace ? "Hide Stack Trace" : "Show Stack Trace"}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 font-mono text-xs text-red-800">
                      {execution.errorStack}
                    </pre>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}
          {execution.output !== undefined && (
            <div className="bg-muted mt-6 rounded-md p-4">
              <p className="mb-2 text-sm font-medium">Output</p>
              <pre className="overflow-auto font-mono text-xs">
                {JSON.stringify(execution.output, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
      <WorkflowExecution
        workflowId={execution.workflowId}
        execution={execution}
      />
    </div>
  );
};
