import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Execution } from "@/db";
import { useSuspenseSingleWorkflowWithExecution } from "@/features/workflows/hooks/use-workflows";
import { edgeTypes, nodeComponents } from "@/lib/configs/workflow-constants";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  ReactFlow,
} from "@xyflow/react";
import { createContext, useCallback, useContext, useState } from "react";

interface WorkflowExecutionProps {
  workflowId: string;
  execution: Execution;
}

const WorkflowExecutionContext = createContext<WorkflowExecutionProps>({
  workflowId: "",
  execution: {} as Execution,
});

export default function WorkflowExecution({
  workflowId,
  execution,
}: WorkflowExecutionProps) {
  return (
    <WorkflowExecutionContext.Provider value={{ workflowId, execution }}>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Workflow Execution View</CardTitle>
          <CardDescription>
            Details of the workflow execution will be displayed here.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[50svh]">
          <main className="h-full flex-1">
            <WorkflowExecutionStatus />
          </main>
        </CardContent>
      </Card>
    </WorkflowExecutionContext.Provider>
  );
}

function WorkflowExecutionStatus() {
  const { execution } = useContext(WorkflowExecutionContext);
  const { data: workflow } = useSuspenseSingleWorkflowWithExecution(
    execution.id,
  );
  console.log("Workflow with execution data:", workflow);
  const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(workflow.edges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  if (!workflow) return null;

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodeTypes={nodeComponents}
        edgeTypes={edgeTypes}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnScroll={false}
        panOnDrag={false}
        selectionOnDrag={false}
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
