"use client";

import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import { Execution } from "@/db";
import { calculateDuration, getStatusIcon, formatStatus } from "@/lib/configs/execution-constants";
import { useEntitySearch } from "@/lib/hooks/use-entity-search";
import { formatDistanceToNow } from "date-fns";
import { useSuspenseExecutions } from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";

export function ExecutionList() {
  const executions = useSuspenseExecutions();
  return (
    <EntityList
      items={executions.data.items}
      getKey={(execution) => execution.id}
      renderItem={(execution) => <ExecutionItem data={execution} />}
      emptyView={<ExecutionEmpty />}
    />
  );
}

export function ExecutionHeader() {
  return (
    <>
      <EntityHeader
        title="Executions"
        description="View your workflow execution history"
      />
    </>
  );
}

export function ExecutionSearch() {
  const [params, setParams] = useExecutionsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <>
      <EntitySearch
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Search Executions history..."
      />
    </>
  );
}

export function ExecutionPagination() {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();

  return (
    <EntityPagination
      disabled={executions.isFetching}
      totalPages={executions.data.totalPages}
      page={params.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
}

export function ExecutionsContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EntityContainer
      header={<ExecutionHeader />}
      search={<ExecutionSearch />}
      pagination={<ExecutionPagination />}
    >
      {children}
    </EntityContainer>
  );
}

export function ExecutionLoading() {
  return <LoadingView message="Loading executions..." entity="executions" />;
}

export function ExecutionError() {
  return <ErrorView message="Error loading executions..." />;
}

export function ExecutionEmpty() {
  return (
    <>
      <EmptyView message="No executions found, Get started by running a workflow" />
    </>
  );
}

export function ExecutionItem({
  data,
}: {
  data: Execution & { userId: string | null; name: string | null };
}) {
  const Icon = getStatusIcon(data.status);
  const duration = calculateDuration(data.startedAt, data.completedAt);

  return (
    <EntityItem
      href={`/executions/${data.id}`}
      title={formatStatus(data.status)}
      subtitle={
        <>
          {data.name} &bull; Started{" "}
          {formatDistanceToNow(new Date(data.startedAt), { addSuffix: true })}{" "}
          {duration !== null && <> &bull; Took {duration}s </>}
        </>
      }
      image={
        <div className="flex size-8 items-center justify-center">{Icon}</div>
      }
    />
  );
}
