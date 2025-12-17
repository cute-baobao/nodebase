"use server";

import { delayChannel } from "@/inngest/channels";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";

export type DelayToken = Realtime.Token<typeof delayChannel, ["status"]>;

export async function fetchDelayRealtimeToken(): Promise<DelayToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: delayChannel(),
    topics: ["status"],
  });

  return token;
}
