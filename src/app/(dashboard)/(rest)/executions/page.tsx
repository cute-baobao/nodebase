import {
  ExecutionError,
  ExecutionList,
  ExecutionLoading,
  ExecutionsContainer,
} from "@/features/executions/components/executions";
import { executionsParamsLoader } from "@/features/executions/server/params-loader";
import { prefetchExecutions } from "@/features/executions/server/prefetch";
import { requireAuth } from "@/lib/utils";
import { HydrateClient } from "@/trpc/server";
import { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function ExecutionPage({ searchParams }: Props) {
  await requireAuth();
  const params = await executionsParamsLoader(searchParams);

  prefetchExecutions(params);
  return (
    <ExecutionsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<ExecutionError />}>
          <Suspense fallback={<ExecutionLoading />}>
            <ExecutionList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </ExecutionsContainer>
  );
}
