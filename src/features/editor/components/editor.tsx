"use client";

import { ErrorView, LoadingView } from "@/components/entity-components";
import { NodeTypeValues } from "@/db";
import { useSuspenseSingleWorkflow } from "@/features/workflows/hooks/use-workflows";
import { nodeComponents } from "@/lib/configs/node-components";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useSetAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";
import { editorAtom } from "../store/atoms";
import { AddNodeButton } from "./add-node-button";
import { ExecuteWorkflowButton } from "./execute-workflow-button";
import { FormatLayoutButton } from "./format-layout-button";

export function EditorLoading() {
  return <LoadingView message="Loading editor..." />;
}

export function EditorError() {
  return <ErrorView message="Error loading editor" />;
}

export function Editor({ workflowId }: { workflowId: string }) {
  const { data: workflow } = useSuspenseSingleWorkflow(workflowId);
  const setEditor = useSetAtom(editorAtom);
  const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(workflow.edges);

  const hasManualTrigger = useMemo(() => {
    return nodes.some((node) => node.type === NodeTypeValues[1]);
  }, [nodes]);

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

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        onInit={setEditor}
        nodeTypes={nodeComponents}
        snapGrid={[10, 10]}
        snapToGrid
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel className="flex flex-col gap-2" position="top-right">
          <AddNodeButton />
          <FormatLayoutButton />
        </Panel>
        {hasManualTrigger && (
          <Panel position="bottom-center">
            <ExecuteWorkflowButton workflowId={workflowId} />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
