import { Client } from '@/components/test-component';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';

export default function TrpcTestPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.getUsers.queryOptions());

  return (
    <div>
      TrpcTestPage:
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<div>Loading...</div>}>
            <Client />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
