import AuthLayout from '@/features/auth/components/auth-layout';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
