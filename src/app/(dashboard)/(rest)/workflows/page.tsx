import { requireAuth } from '@/lib/utils';

export default async function WorkflowPage() {
  await requireAuth();
  return <div>WorkflowPage</div>;
}
