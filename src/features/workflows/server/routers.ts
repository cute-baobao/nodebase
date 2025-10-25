import db, { workflow } from "@/db";
import { PAGINATION } from "@/lib/configs/constans";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { and, desc, eq, ilike } from "drizzle-orm";
import z from "zod";

export const workflowsRouter = createTRPCRouter({
  create: premiumProcedure.mutation(async ({ ctx }) => {
    return await db
      .insert(workflow)
      .values({
        name: "new workflow",
        userId: ctx.auth.user.id,
      })
      .returning();
  }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await db
        .delete(workflow)
        .where(
          and(eq(workflow.id, input.id), eq(workflow.userId, ctx.auth.user.id)),
        ).returning();
    }),
  update: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return await db
        .update(workflow)
        .set({
          name: input.name,
        })
        .where(
          and(eq(workflow.id, input.id), eq(workflow.userId, ctx.auth.user.id)),
        );
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await db.query.workflow.findFirst({
        where: and(
          eq(workflow.id, input.id),
          eq(workflow.userId, ctx.auth.user.id),
        ),
      });
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
