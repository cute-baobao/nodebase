import db, { connection, node, NodeType, NodeTypeValues, workflow } from "@/db";
import { inngest } from "@/inngest/client";
import { sendWorkflowExecution } from "@/inngest/utils";
import { PAGINATION } from "@/lib/configs/constants";
import { edgeSchema, nodeSchema } from "@/lib/shared/schemas/workflow";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { type Edge, type Node } from "@xyflow/react";
import { and, desc, eq, ilike } from "drizzle-orm";
import z from "zod";

export const workflowsRouter = createTRPCRouter({
  execute: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const workflow = await WorkflowDb.getOne({
        workflowId: id,
        userId: ctx.auth.user.id,
      });

      await sendWorkflowExecution({
        workflowId: workflow.id,
      });

      return workflow;
    }),
  create: premiumProcedure.mutation(async ({ ctx }) => {
    return await db.transaction(async (tx) => {
      const [workflowData] = await tx
        .insert(workflow)
        .values({
          name: "New Workflow",
          userId: ctx.auth.user.id,
        })
        .returning();

      console.log("Creating initial node for workflow:", workflowData.id);

      await tx.insert(node).values({
        name: NodeTypeValues[0],
        type: NodeTypeValues[0],
        workflowId: workflowData.id,
        position: { x: 0, y: 0 },
      });
      return workflowData;
    });
  }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await db
        .delete(workflow)
        .where(
          and(eq(workflow.id, input.id), eq(workflow.userId, ctx.auth.user.id)),
        )
        .returning();
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nodes: z.array(nodeSchema),
        edges: z.array(edgeSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, nodes, edges } = input;
      const data = await WorkflowDb.getOne({
        workflowId: id,
        userId: ctx.auth.user.id,
      });
      return await db.transaction(async (tx) => {
        await tx.delete(node).where(eq(node.workflowId, data.id));

        if (nodes.length > 0) {
          await tx
            .insert(node)
            .values(
              nodes.map((node) => ({
                id: node.id,
                type: node.type as NodeType,
                workflowId: id,
                position: node.position,
                data: node.data,
                name: node.type || "Unnamed Node",
              })),
            )
            .onConflictDoNothing();
        }

        await tx.delete(connection).where(eq(connection.workflowId, data.id));

        if (edges.length > 0) {
          await tx
            .insert(connection)
            .values(
              edges.map((edge) => ({
                workflowId: id,
                fromNodeId: edge.source,
                toNodeId: edge.target,
                fromOutput: edge.sourceHandle || "main",
                toInput: edge.targetHandle || "main",
              })),
            )
            .onConflictDoNothing();
        }

        await tx
          .update(workflow)
          .set({ updatedAt: new Date() })
          .where(eq(workflow.id, data.id));

        return data;
      });
    }),
  updateName: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return await db
        .update(workflow)
        .set({
          name: input.name,
        })
        .where(
          and(eq(workflow.id, input.id), eq(workflow.userId, ctx.auth.user.id)),
        )
        .returning();
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const data = await WorkflowDb.getOne({
        workflowId: input.id,
        userId: ctx.auth.user.id,
      });

      // transform nodes and connections to match React Flow format
      const nodes: Node[] = data.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position as { x: number; y: number },
        data: node.data as Record<string, unknown>,
      }));

      const edges: Edge[] = data.connections.map((connection) => ({
        id: connection.id,
        source: connection.fromNodeId,
        target: connection.toNodeId,
        sourceHandle: connection.fromOutput,
        targetHandle: connection.toInput,
      }));

      return {
        id: data.id,
        name: data.name,
        nodes,
        edges,
      };
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const whereCondition = search
        ? and(
            eq(workflow.userId, ctx.auth.user.id),
            ilike(workflow.name, `%${search}%`),
          )
        : eq(workflow.userId, ctx.auth.user.id);

      const [items, totalCount] = await Promise.all([
        db.query.workflow.findMany({
          where: whereCondition,
          offset: (page - 1) * pageSize,
          limit: pageSize,
          orderBy: desc(workflow.createdAt),
        }),
        db.$count(workflow, whereCondition),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),
});

// 提取出常用的数据库操作
export class WorkflowDb {
  static async getOne({
    workflowId,
    userId,
  }: {
    workflowId: string;
    userId: string;
  }) {
    const data = await db.query.workflow.findFirst({
      where: and(eq(workflow.id, workflowId), eq(workflow.userId, userId)),
      with: {
        nodes: true,
        connections: true,
      },
    });
    if (data === undefined) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Workflow with id ${workflowId} not found`,
      });
    }
    return data;
  }

  static async getOneWithoutUser({ workflowId }: { workflowId: string }) {
    const data = await db.query.workflow.findFirst({
      where: eq(workflow.id, workflowId),
      with: {
        nodes: true,
        connections: true,
      },
    });
    if (data === undefined) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Workflow with id ${workflowId} not found`,
      });
    }
    return data;
  }
}
