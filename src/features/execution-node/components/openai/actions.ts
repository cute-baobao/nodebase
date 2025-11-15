"use server";

import { openaiChannel } from "@/inngest/channels";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";

export type OpenaiToken = Realtime.Token<
  typeof openaiChannel,
  ["status"]
>;

export async function fetchOpenaiRealtimeToken(): Promise<OpenaiToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: openaiChannel(),
    topics: ["status"],
  });

  return token;
}
