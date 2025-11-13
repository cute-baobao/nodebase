import { prefetch, trpc } from "@/trpc/server";
import { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.credentials.getMany>;

export function prefetchCredentials(params: Input) {
  return prefetch(trpc.credentials.getMany.queryOptions(params));
}

export function prefetchSingleCredentials(id: string) {
  return prefetch(trpc.credentials.getOne.queryOptions({ id }));
}
