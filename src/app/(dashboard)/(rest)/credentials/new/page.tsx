import { CredentialForm } from "@/features/credentials/components/credential";
import { requireAuth } from "@/lib/utils";

export default async function NewCredentialPage() {
  await requireAuth();
  return (
    <div className="h-full p-4 md:px-10 md:py-6">
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-y-8">
        <CredentialForm />
      </div>
    </div>
  );
}
