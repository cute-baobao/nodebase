import { Node } from "@xyflow/react";
import { z } from "zod";

export const httpRequestDataSchema = z.object({
  endpoint: z.url({ message: "Please enter a valid URL" }),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  body: z.string().optional(),
});

export type HttpRequestData = z.infer<typeof httpRequestDataSchema>;

export type HttpRequestNodeType = Node<HttpRequestData>;
