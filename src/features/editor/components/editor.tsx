"use client";

import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseSingleWorkflow } from "@/features/workflows/hooks/use-workflows";

export function EditorLoading() {
  return <LoadingView message="Loading editor..." />;
}

export function EditorError() {
  return <ErrorView message="Error loading editor" />;
}

export function Editor({ workflowId }: { workflowId: string }) {
  const { data: workflow } = useSuspenseSingleWorkflow(workflowId);
  return <p>{JSON.stringify(workflow, null, 2)}</p>;
}
