"use server";

import db from "@/db/instance";
import { NonRetriableError } from "inngest";
/**
 * @description Checks if a node can be executed by verifying its existence and incoming connections.
 * @param nodeId
 */
export async function checkNodeCanExecute(nodeId: string) {
  const node = await db.query.node.findFirst({
    where: (node, { eq }) => eq(node.id, nodeId),
  });

  if (!node) {
    throw new NonRetriableError(`Node with id ${nodeId} does not exist`);
  }

  // check if the node has any incoming connections
  const nodeConnections = await db.query.connection.findFirst({
    where: (connection, { eq, and }) => eq(connection.toNodeId, nodeId),
  });

  console.log

  if (!nodeConnections) {
    throw new NonRetriableError(
      `Node with id ${nodeId} has no incoming connections`,
    );
  }
}
