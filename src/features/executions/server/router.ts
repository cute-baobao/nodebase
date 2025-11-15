import { execution, workflow } from "@/db";
import db from "@/db/instance";
import { PAGINATION } from "@/lib/configs/constants";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import z from "zod";

export const executionsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const data = await ExecutionDB.getOne({
        executionId: input.id,
        userId: ctx.auth.user.id,
      });
      return data;
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

      const [items, totalCount] = await Promise.all([
        db
          .select({
            ...getTableColumns(execution),
            userId: workflow.userId,
            name: workflow.name,
          })
          .from(execution)
          .leftJoin(workflow, eq(execution.workflowId, workflow.id))
          .where(
            and(
              eq(workflow.userId, ctx.auth.user.id),
              ilike(workflow.name, `%${search}%`),
            ),
          )
          .offset((page - 1) * pageSize)
          .limit(pageSize)
          .orderBy(desc(execution.startedAt)),
        db
          .execute(
            sql`select count(*) from ${execution} left join ${workflow} on ${execution.workflowId} = ${workflow.id} where ${workflow.userId} = ${ctx.auth.user.id}`,
          )
          .then((result) => Number(result.rows[0].count)),
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
export class ExecutionDB {
  static async getOne({
    executionId,
    userId,
  }: {
    executionId: string;
    userId: string;
  }) {
    const data = await db.query.execution.findFirst({
      where: eq(execution.id, executionId),
      with: {
        workflow: true,
      },
    });
    if (data?.workflow.userId !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You do not have access to execution with id ${executionId}`,
      });
    }
    if (data === undefined) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Execution with id ${executionId} not found`,
      });
    }
    return data;
  }
}
