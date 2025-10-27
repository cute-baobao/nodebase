import { z } from "zod";

export const nodeSchema = z.object({
  id: z.string(),
  type: z.string().nullish(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.record(z.string(), z.unknown()),
});

export type NodeSchema = z.infer<typeof nodeSchema>;

export const edgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().nullish(),
  targetHandle: z.string().nullish(),
});

export type EdgeSchema = z.infer<typeof edgeSchema>;
