import { Connection, execution, Node } from "@/db";
import db from "@/db/instance";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { Realtime, topic } from "@inngest/realtime";
import { eq } from "drizzle-orm";
import toposort from "toposort";
import { v4 as createID } from "uuid";
import { inngest } from "./client";

export const topologicalSort = (
  nodes: Node[],
  connections: Connection[],
): Node[] => {
  // if no connections, return nodes as is
  if (connections.length === 0) return nodes;

  const edges: [string, string][] = connections.map((conn) => [
    conn.fromNodeId,
    conn.toNodeId,
  ]);

  const connectedNodeIds = new Set<string>();
  for (const conn of connections) {
    connectedNodeIds.add(conn.fromNodeId);
    connectedNodeIds.add(conn.toNodeId);
  }

  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  let sortedNodeIds: string[];

  try {
    sortedNodeIds = toposort(edges);
    // remove duplicates (from self-edges)
    sortedNodeIds = [...new Set(sortedNodeIds)];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("Workflow contains a cycle");
    }
    throw error;
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
};

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  [key: string]: unknown;
}) => {
  return inngest.send({
    name: "workflows/execute.workflow",
    data,
    id: createID(),
  });
};

// 首先定义 status topic 的数据结构
const statusTopic = topic("status").type<{
  nodeId: string;
  status: NodeStatus;
}>();

// 定义 channel 类型
type MyChannel = Realtime.Channel<
  string, // channel ID 类型
  {
    status: typeof statusTopic; // topic 定义
  }
>;

export const updateNodeStatus = async ({
  channel,
  nodeId,
  executionId,
  status,
  publish,
}: {
  publish: Realtime.PublishFn;
  channel: MyChannel;
  nodeId: string;
  executionId: string;
  status: NodeStatus;
}) => {
  // 发布实时消息
  await publish(
    channel.status({
      nodeId,
      status,
    }),
  );

  // 更新数据库状态
  const executionNodeStatus = await db.query.execution.findFirst({
    where: (ex, { eq }) => eq(ex.id, executionId),
    columns: {
      nodeStatus: true,
    },
  });

  if (!executionNodeStatus) return;

  const currentStatus = executionNodeStatus.nodeStatus || {};
  const updatedStatus = {
    ...currentStatus,
    [nodeId]: {
      status: status,
    },
  };

  await db
    .update(execution)
    .set({ nodeStatus: updatedStatus })
    .where(eq(execution.id, executionId));
};
