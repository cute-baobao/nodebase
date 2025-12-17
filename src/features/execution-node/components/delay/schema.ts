import { Node } from "@xyflow/react";
import { z } from "zod";

export const delayDataSchema = z.object({
  duration: z
    .number()
    .min(0, { message: "Duration must be greater than or equal to 0" })
    .max(86400000, { message: "Duration must be less than or equal to 24 hours (86400000 ms)" }),
});

export type DelayData = z.infer<typeof delayDataSchema>;

export type DelayNodeType = Node<DelayData>;
