"use server";

import { resendChannel } from "@/inngest/channels";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";

export type ResendToken = Realtime.Token<typeof resendChannel, ["status"]>;

export async function fetchResendRealtimeToken(): Promise<ResendToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: resendChannel(),
    topics: ["status"],
  });

  return token;
}
