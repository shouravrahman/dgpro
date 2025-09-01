'use client';

import { useAuth, useRequireAuth } from '@/lib/auth/context';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LoadingSpinner } from '@/components/ui/loading-states';
import { MarketIntelligenceDashboard } from '@/components/market-intelligence/market-intelligence-dashboard';

export default function TrendsPage() {
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Market Intelligence"
      description="AI-powered market insights and trending opportunities"
    >
      <MarketIntelligenceDashboard />
    </DashboardLayout>
  );
}
