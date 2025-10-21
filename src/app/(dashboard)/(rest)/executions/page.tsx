import { requireAuth } from '@/lib/utils';

export default async function ExecutionPage() {
  await requireAuth();
  return <div>ExecutionPage</div>;
}
