import { requireAuth } from "@/lib/utils";

interface CredentialDetailPageProps {
  params: Promise<{
    credentialId: string;
  }>;
}

export default async function CredentialDetailPage({
  params,
}: CredentialDetailPageProps) {
  await requireAuth();
  const { credentialId } = await params;
  return <div>CredentialDetailPage: {credentialId}</div>;
}
