import { requireAuth } from "@/lib/utils";

interface WorkflowEditorPageProps {
  params: Promise<{
    workflowId: string;
  }>;
}

export default async function WorkflowEditorPage({
  params,
}: WorkflowEditorPageProps) {
  await requireAuth();
  const { workflowId } = await params;
  return <div>WorkflowEditorPage: {workflowId}</div>;
}
