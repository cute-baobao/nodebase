import { useTRPC } from "@/lib/providers/trpc-client-provider";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useExecutionsParams } from "./use-executions-params";

/**
 * @description Custom hook to fetch all executions using suspense.
 * @returns A suspense query for fetching all executions.
 */
export const useSuspenseExecutions = () => {
  const trpc = useTRPC();
  const [params] = useExecutionsParams();

  return useSuspenseQuery(trpc.executions.getMany.queryOptions(params));
};

/**
 * @description Custom hook to fetch single execution using suspense.
 * @param id execution id
 * @returns A suspense query for fetching single execution.
 */
export const useSuspenseSingleExecution = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.executions.getOne.queryOptions({ id }));
};
