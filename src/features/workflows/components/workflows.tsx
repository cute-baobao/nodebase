'use client';

import { useSuspenseWorkflows } from '../hooks/use-workflows';

export function WorkflowsList() {
  const workflows = useSuspenseWorkflows();

  return <pre>{JSON.stringify(workflows.data, null, 2)}</pre>;
}
