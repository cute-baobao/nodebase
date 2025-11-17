import { ExecutionView } from "@/features/executions/components/execution";
import {
  ExecutionError,
  ExecutionLoading,
} from "@/features/executions/components/executions";
import { prefetchSingleExecution } from "@/features/executions/server/prefetch";
import { prefetchSingleWorkflowWithExecution } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/utils";
import { HydrateClient } from "@/trpc/server";
import "@xyflow/react/dist/style.css";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

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

  prefetchSingleExecution(executionId);
  prefetchSingleWorkflowWithExecution(executionId);

  return (
    <div className="h-full p-4 md:px-10 md:py-6">
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-y-8">
        <HydrateClient>
          <ErrorBoundary fallback={<ExecutionError />}>
            <Suspense fallback={<ExecutionLoading />}>
              <ExecutionView executionId={executionId} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
}
