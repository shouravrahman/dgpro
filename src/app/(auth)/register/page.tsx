'use client';

import { RegisterForm } from '@/components/auth/register-form';
import { useRedirectIfAuthenticated } from '@/lib/auth/context';
import { LoadingSpinner } from '@/components/ui/loading-states';

export default function RegisterPage() {
  const { loading } = useRedirectIfAuthenticated();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}
