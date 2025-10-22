import { useTRPC } from '@/lib/providers/trpc-client-provider';
import { useSuspenseQuery } from '@tanstack/react-query';

export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.workflows.getAll.queryOptions());
};
