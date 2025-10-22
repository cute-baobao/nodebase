import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from '@tanstack/react-query';
import superjson from 'superjson';
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        // avoid refetching on mount which could mutate hydrated data during
        // the initial client hydration and cause mismatches
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}