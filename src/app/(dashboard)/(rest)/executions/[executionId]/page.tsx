import { requireAuth } from '@/lib/utils';

interface ExecutionDetailPageProps {
  params: Promise<{
    executionId: string;
  }>;
}

export default async function ExecutionDetailPage({
  params,
}: ExecutionDetailPageProps) {
  await requireAuth();
  const { executionId } = await params;
  return <div>ExecutionDetailPage: {executionId}</div>;
}
