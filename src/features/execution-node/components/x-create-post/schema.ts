import { Node } from "@xyflow/react";
import { z } from "zod";

export const xCreatePostDataSchema = z.object({
  // credentialId: z.string().min(1, { message: "Credential ID is required" }),
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[a-zA-Z_][a-zA-Z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  // content of the post
  text: z
    .string()
    .min(1, { message: "Post content is required" })
    .max(300, { message: "Post content cannot exceed 300 characters" }),
  // if have this field, it means this post is a reply to another tweet
  in_reply_to_tweet_id: z.string().optional(),
});

export type XCreatePostData = z.infer<typeof xCreatePostDataSchema>;

export type XCreatePostNodeType = Node<XCreatePostData>;
