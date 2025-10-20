'use client';

import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth-client';
import { test } from '@/server/actions/ai-test';

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Button onClick={() => test()}>HELLO</Button>
    </div>
  );
}
