'use client';

import { Button } from '@/components/ui/button';
import { signOut, useSession } from '@/lib/auth-client';

export default function HomePage() {
  const { data: session } = useSession();
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      {JSON.stringify(session, null, 2)}
      {session && <Button onClick={() => signOut()}>Sign Out</Button>}
    </div>
  );
}
