import db, { workflow } from '@/db';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { and, eq } from 'drizzle-orm';
import z from 'zod';

export const workflowsRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    return await db.insert(workflow).values({
      name: 'new workflow',
      userId: ctx.auth.user.id,
    });
  }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await db
        .delete(workflow)
        .where(
          and(eq(workflow.id, input.id), eq(workflow.userId, ctx.auth.user.id)),
        );
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
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await db.query.workflow.findMany({
      where: eq(workflow.userId, ctx.auth.user.id),
    });
  }),
});
