"use server";

import { WorkflowDb } from "@/features/workflows/server/routers";
import { NonRetriableError } from "inngest";

export async function checkWorkflowActive(workflowId: string) {
  const workflow = await WorkflowDb.getOneWithoutUser({ workflowId });
  if (!workflow.active) {
    throw new NonRetriableError("Workflow is not active");
  }
}
