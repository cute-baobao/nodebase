import { DEEPSEEK_AVAILABLE_MODELS } from "@/lib/configs/ai-constants";
import { Node } from "@xyflow/react";
import { z } from "zod";

export const deepseekDataSchema = z.object({
  credentialId: z.string().min(1, { message: "Credential ID is required" }),
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[a-zA-Z_][a-zA-Z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  model: z.enum(DEEPSEEK_AVAILABLE_MODELS),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, { message: "User prompt is required" }),
});

export type DeepseekData = z.infer<typeof deepseekDataSchema>;

export type DeepseekNodeType = Node<DeepseekData>;
