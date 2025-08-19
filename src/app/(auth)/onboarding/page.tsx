'use client';

import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { useRequireAuth } from '@/lib/auth/context';
import { ErrorBoundary } from '@/components/error/error-boundary';
import { LoadingSpinner } from '@/components/ui/loading-states';

export default function OnboardingPage() {
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <OnboardingFlow />
      </div>
    </ErrorBoundary>
  );
}
