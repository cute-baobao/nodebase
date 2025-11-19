"use server";

import { WorkflowDb } from "@/features/workflows/server/routers";

export async function checkWorkflowActive(workflowId: string) {
  const workflow = await WorkflowDb.getOneWithoutUser({ workflowId });
  if (!workflow.active) {
    throw new Error("Workflow is not active");
  }
}
