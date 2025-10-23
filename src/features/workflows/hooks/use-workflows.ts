import { useTRPC } from '@/lib/providers/trpc-client-provider';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * @description Custom hook to fetch all workflows using suspense.
 * @returns A suspense query for fetching all workflows.
 */
export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.workflows.getAll.queryOptions());
};

/**
 * @description Hook to create a new workflow.
 * @returns A TRPC mutation for creating a new workflow.
 */
export const useCreateWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation(
    trpc.workflows.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow ${data[0].name} created`);
        queryClient.invalidateQueries(trpc.workflows.getAll.queryOptions());
      },
      onError: (error) => {
        toast.error(`Failed to create workflow: ${error.message}`);
      },
    }),
  );
};
