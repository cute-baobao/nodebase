import { Node } from "@xyflow/react";
import { z } from "zod";

export const cronJobDataSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[a-zA-Z_][a-zA-Z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  cronExpression: z
    .string()
    .min(1, { message: "Cron expression is required" })
    .regex(
      /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/,
      {
        message: "Invalid cron expression format (e.g. * * * * *)",
      },
    )
    .or(z.string().min(1)), // Allow other formats if needed, but basic regex helps
  timezone: z.string().optional(),
});

export type CronJobData = z.infer<typeof cronJobDataSchema>;

export type CronJobNodeType = Node<CronJobData>;
