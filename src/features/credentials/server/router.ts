import { credential, credentialType, CredentialTypeValues } from "@/db";
import db from "@/db/instance";
import { PAGINATION } from "@/lib/configs/constants";
import { encrypt } from "@/lib/utils/encryption";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike } from "drizzle-orm";
import z from "zod";

export const credentialsRouter = createTRPCRouter({
  create: premiumProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.enum(credentialType.enumValues),
        value: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, type, value } = input;
      const [credentialData] = await db
        .insert(credential)
        .values({
          name,
          type,
          value: encrypt(value), 
          userId: ctx.auth.user.id,
        })
        .returning();
      return credentialData;
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await db
        .delete(credential)
        .where(
          and(
            eq(credential.id, input.id),
            eq(credential.userId, ctx.auth.user.id),
          ),
        )
        .returning();
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        type: z.enum(credentialType.enumValues),
        value: z.string().min(1, "Value is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, type, value } = input;
      const [result] = await db
        .update(credential)
        .set({
          name,
          type,
          value: encrypt(value),
        })
        .where(
          and(eq(credential.id, id), eq(credential.userId, ctx.auth.user.id)),
        )
        .returning();
      return result;
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const data = await CredentialDB.getOne({
        credentialId: input.id,
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

      const whereCondition = search
        ? and(
            eq(credential.userId, ctx.auth.user.id),
            ilike(credential.name, `%${search}%`),
          )
        : eq(credential.userId, ctx.auth.user.id);

      const [items, totalCount] = await Promise.all([
        db.query.credential.findMany({
          where: whereCondition,
          offset: (page - 1) * pageSize,
          limit: pageSize,
          orderBy: desc(credential.createdAt),
        }),
        db.$count(credential, whereCondition),
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
  getByType: protectedProcedure
    .input(z.object({ type: z.enum(CredentialTypeValues) }))
    .query(({ ctx, input }) => {
      const items = db.query.credential.findMany({
        where: and(
          eq(credential.userId, ctx.auth.user.id),
          eq(credential.type, input.type),
        ),
        orderBy: desc(credential.createdAt),
      });
      return items;
    }),
});

// 提取出常用的数据库操作
export class CredentialDB {
  static async getOne({
    credentialId,
    userId,
  }: {
    credentialId: string;
    userId: string;
  }) {
    const data = await db.query.credential.findFirst({
      where: and(
        eq(credential.id, credentialId),
        eq(credential.userId, userId),
      ),
    });
    if (data === undefined) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Credential with id ${credentialId} not found`,
      });
    }
    return data;
  }
}
