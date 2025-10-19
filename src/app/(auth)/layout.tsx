import { requireNoAuth } from '@/lib/utils/auth-utils';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireNoAuth();  
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      {children}
    </div>
  );
}
