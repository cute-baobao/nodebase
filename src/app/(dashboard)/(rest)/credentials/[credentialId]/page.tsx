import { CredentialView } from "@/features/credentials/components/credential";
import {
  CredentialError,
  CredentialLoading,
} from "@/features/credentials/components/credentials";
import { prefetchSingleCredential } from "@/features/credentials/server/prefetch";
import { requireAuth } from "@/lib/utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

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
  prefetchSingleCredential(credentialId);

  return (
    <div className="h-full p-4 md:px-10 md:py-6">
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-y-8">
        <HydrateClient>
          <ErrorBoundary fallback={<CredentialError />}>
            <Suspense fallback={<CredentialLoading />}>
              <CredentialView credentialId={credentialId} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
}
