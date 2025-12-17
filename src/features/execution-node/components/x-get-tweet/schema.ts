import { Node } from "@xyflow/react";
import { z } from "zod";

export const xGetTweetDataSchema = z.object({
  // credentialId: z.string().min(1, { message: "Credential ID is required" }),
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[a-zA-Z_][a-zA-Z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  userId: z.string().min(1, { message: "User ID is required" }),
  since: z.boolean(),
  maxTweets: z.number().min(5).max(100),
});

export type XGetTweetData = z.infer<typeof xGetTweetDataSchema>;

export type XGetTweetNodeType = Node<XGetTweetData>;