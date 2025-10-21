interface WorkflowEditorPageProps {
  params: Promise<{
    workflowId: string;
  }>;
}

export default async function WorkflowEditorPage({
  params,
}: WorkflowEditorPageProps) {
  const { workflowId } = await params;
  return <div>WorkflowEditorPage: {workflowId}</div>;
}
