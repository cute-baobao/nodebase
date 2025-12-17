"use server";

import { xGetTweetChannel } from "@/inngest/channels";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";

export type XGetTweetToken = Realtime.Token<
  typeof xGetTweetChannel,
  ["status"]
>;

export async function fetchXGetTweetRealtimeToken(): Promise<XGetTweetToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: xGetTweetChannel(),
    topics: ["status"],
  });

  return token;
}
