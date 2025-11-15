import { Node } from "@xyflow/react";
import { z } from "zod";

export const discordDataSchema = z.object({
  variableName: z.string().min(1, "Variable name is required"),
  webhookUrl: z.string().min(1, "Webhook URL is required"),
  content: z.string().min(1, "Content is required"),
  username: z.string(),
});

export type DiscordData = z.infer<typeof discordDataSchema>;

export type discordNodeType = Node<DiscordData>;
