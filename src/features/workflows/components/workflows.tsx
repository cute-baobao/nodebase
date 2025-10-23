'use client';

import { EntityContainer, EntityHeader } from '@/components/entity-components';
import { useUpgradeModal } from '@/lib/hooks/use-upgrade-modal';
import {
  useCreateWorkflow,
  useSuspenseWorkflows,
} from '../hooks/use-workflows';
import { useRouter } from 'next/navigation';

export function WorkflowsList() {
  const { data: workflows } = useSuspenseWorkflows();

  return (
    <div className="flex flex-1 items-center justify-center">
      {JSON.stringify(workflows, null, 2)}
    </div>
  );
}

export function WorkflowsHeader({ disabled }: { disabled?: boolean }) {
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();
  const router = useRouter();

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess:(data) => {
        router.push(`/workflows/${data[0].id}`);
      },
      onError: handleError,
    });
  };
  return (
    <>
      {modal}
      <EntityHeader
        title="Workflows"
        description="Create and manage your workflows"
        onNew={handleCreate}
        newButtonLabel="New workflow"
        disabled={disabled}
        isCreating={createWorkflow.isPending}
      />
    </>
  );
}

export function WorkflowsContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<></>}
      pagination={<></>}
    >
      {children}
    </EntityContainer>
  );
}
