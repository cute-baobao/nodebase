import { requireAuth } from '@/lib/utils';

export default async function CredentialPage() {
  await requireAuth();
  return <div>CredentialPage</div>;
}
