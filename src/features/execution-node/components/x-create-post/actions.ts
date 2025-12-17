"use server";

import { resendChannel } from "@/inngest/channels";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";

export type XCreatePostToken = Realtime.Token<typeof resendChannel, ["status"]>;

export async function fetchXCreatePostRealtimeToken(): Promise<XCreatePostToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: resendChannel(),
    topics: ["status"],
  });

  return token;
}
