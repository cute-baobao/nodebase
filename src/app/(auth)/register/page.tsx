import RegisterForm from '@/features/auth/components/register-form';
import { requireNoAuth } from '@/lib/utils';

export default async function RegisterPage() {
  await requireNoAuth();
  return <RegisterForm />;
}
