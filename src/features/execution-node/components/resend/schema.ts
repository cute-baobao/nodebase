import { Node } from "@xyflow/react";
import { z } from "zod";

export const resendDataSchema = z.object({
  credentialId: z.string().min(1, { message: "Credential ID is required" }),
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[a-zA-Z_][a-zA-Z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  from: z.string().min(1, { message: "From email is required" }),
  to: z
    .array(
      z.object({
        email: z
          .email({ message: "Invalid email address" })
          .min(1, { message: "Email is required" }),
      }),
    )
    .min(1, { message: "At least one recipient email is required" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  content: z.string().min(1, { message: "Content is required" }),
});

export type ResendData = z.infer<typeof resendDataSchema>;

export type ResendNodeType = Node<ResendData>;
