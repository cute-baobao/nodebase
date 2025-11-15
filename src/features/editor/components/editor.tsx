"use client";

import { EdgeWithToolbar } from "@/components/edge-with-toolbar";
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
  EdgeTypes,
  MiniMap,
  Panel,
  ReactFlow,
  reconnectEdge,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useSetAtom } from "jotai";
import { useCallback, useMemo, useRef, useState } from "react";
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

const edgeType: EdgeTypes = {
  edgeWithToolbar: EdgeWithToolbar,
};

export function Editor({ workflowId }: { workflowId: string }) {
  const { data: workflow } = useSuspenseSingleWorkflow(workflowId);
  const edgeReconnectSuccessful = useRef(true);
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

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true;
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    },
    [],
  );

  const onReconnectEnd = useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }

      edgeReconnectSuccessful.current = true;
    },
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
        defaultEdgeOptions={{ type: "edgeWithToolbar" }}
        onInit={setEditor}
        nodeTypes={nodeComponents}
        snapGrid={[10, 10]}
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
        snapToGrid
        edgeTypes={edgeType}
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
