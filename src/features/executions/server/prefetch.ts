import { prefetch, trpc } from "@/trpc/server";
import { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.executions.getMany>;

export function prefetchExecutions(params: Input) {
  return prefetch(trpc.executions.getMany.queryOptions(params));
}

export function prefetchSingleExecution(id: string) {
  return prefetch(trpc.executions.getOne.queryOptions({ id }));
}
