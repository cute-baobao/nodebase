'use client';
import { useTRPC } from '@/lib/providers/trpc-client-provider';
import { useSuspenseQuery } from '@tanstack/react-query';

export const Client = () => {
  const trpc = useTRPC();
  const { data: users } = useSuspenseQuery(trpc.getUsers.queryOptions());

  return <div>Client Component: {JSON.stringify(users)}</div>;
};
