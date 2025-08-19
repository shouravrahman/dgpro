'use client';

import { useAuth, useRequireAuth, useFeatureAccess } from '@/lib/auth/context';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LoadingSpinner } from '@/components/ui/loading-states';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreatorPage() {
  const { onboardingStatus } = useAuth();
  const { loading } = useRequireAuth();
  const canCreateProducts = useFeatureAccess('create-product');
  const router = useRouter();

  // Redirect non-creators to marketplace
  useEffect(() => {
    if (
      !loading &&
      onboardingStatus?.isCompleted &&
      onboardingStatus?.role !== 'creator'
    ) {
      router.push('/marketplace');
    }
  }, [loading, onboardingStatus, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!canCreateProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
          <p className="text-muted-foreground">
            This page is only available to creators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Creator Studio"
      description="Create and manage your digital products"
    >
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome to Creator Studio</h2>
          <p className="text-muted-foreground mb-4">
            This is where you&apos;ll create and manage your digital products.
            The full creator interface is coming soon!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Product Creation</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered product generation tools
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track your product performance
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Revenue</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your earnings
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
