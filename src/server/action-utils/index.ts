'use server';

import { auth } from '@/lib/auth';
import { polarClient } from '@/lib/polar';
import { CustomerState } from '@polar-sh/sdk/models/components/customerstate.js';
import { headers } from 'next/headers';

type AuthReturnType = Awaited<ReturnType<typeof auth.api.getSession>>;

export async function aticonRequireAuth(): Promise<AuthReturnType> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function aticonRequirePro(): Promise<{
  session: AuthReturnType;
  customer: CustomerState;
}> {
  const session = await aticonRequireAuth();
  const customer = await polarClient.customers.getStateExternal({
    externalId: session!.user.id,
  });

  if (
    !customer.activeSubscriptions ||
    customer.activeSubscriptions.length === 0
  ) {
    throw new Error('Pro Only');
  }

  return { session, customer };
}
