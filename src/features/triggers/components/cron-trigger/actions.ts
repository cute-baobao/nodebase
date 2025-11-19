"use server";

import { cronTriggerChannel } from "@/inngest/channels";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";

export type CronTriggerToken = Realtime.Token<
  typeof cronTriggerChannel,
  ["status"]
>;

export async function fetchCronTriggerRealtimeToken(): Promise<CronTriggerToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: cronTriggerChannel(),
    topics: ["status"],
  });

  return token;
}
