import { GEMINI_AVAILABLE_MODELS } from "@/lib/configs/ai-constants";
import { Node } from "@xyflow/react";
import { z } from "zod";

export const geminiDataSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[a-zA-Z_][a-zA-Z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  credentialId: z.string().min(1, { message: "Credential ID is required" }),
  model: z.enum(GEMINI_AVAILABLE_MODELS),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, { message: "User prompt is required" }),
});

export type GeminiData = z.infer<typeof geminiDataSchema>;

export type GeminiNodeType = Node<GeminiData>;
