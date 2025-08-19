'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleSelection } from './role-selection';
import { CreatorOnboarding } from './creator-onboarding';
import { BuyerOnboarding } from './buyer-onboarding';
import { OnboardingComplete } from './onboarding-complete';
import { LoadingSpinner } from '@/components/ui/loading-states';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth/context';
import type { UserRole } from '@/lib/validations/onboarding';

export function OnboardingFlow() {
  const { user, onboardingStatus, onboardingLoading, refreshOnboardingStatus } =
    useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Handle role selection
  const handleRoleSelect = async (role: UserRole) => {
    try {
      const response = await fetch('/api/onboarding/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role');
      }

      // Refresh onboarding status to get updated data
      await refreshOnboardingStatus();

      toast({
        title: 'Success',
        description: `Welcome! Let's set up your ${role} account.`,
      });
    } catch (error) {
      console.error('Error selecting role:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      throw error; // Re-throw to handle in component
    }
  };

  // Handle step completion
  const handleStepComplete = async (step: number, data: any) => {
    if (!onboardingStatus?.role) {
      toast({
        title: 'Error',
        description: 'Please select a role first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/onboarding/step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: onboardingStatus.role,
          step,
          data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete step');
      }

      // Refresh onboarding status
      await refreshOnboardingStatus();

      toast({
        title: 'Progress Saved',
        description: `Step ${step} completed successfully!`,
      });
    } catch (error) {
      console.error('Error completing step:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      throw error; // Re-throw to handle in component
    }
  };

  // Show loading while fetching user or onboarding status
  if (!user || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show role selection if no role is set
  if (!onboardingStatus || !onboardingStatus.role) {
    return <RoleSelection onRoleSelect={handleRoleSelect} />;
  }

  // Show completion screen if onboarding is finished
  if (onboardingStatus.isCompleted) {
    return <OnboardingComplete role={onboardingStatus.role} />;
  }

  // Show appropriate onboarding steps based on role
  if (onboardingStatus.role === 'creator') {
    return (
      <CreatorOnboarding
        currentStep={onboardingStatus.currentStep}
        completedSteps={onboardingStatus.completedSteps}
        onStepComplete={handleStepComplete}
      />
    );
  }

  if (onboardingStatus.role === 'buyer') {
    return (
      <BuyerOnboarding
        currentStep={onboardingStatus.currentStep}
        completedSteps={onboardingStatus.completedSteps}
        onStepComplete={handleStepComplete}
      />
    );
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">
          Unable to determine onboarding flow
        </p>
        <button
          onClick={() => refreshOnboardingStatus()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
