'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useSubscription, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { formatDate } from '@/lib/utils';
import {
  CreditCard,
  Calendar,
  Pause,
  Play,
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export function SubscriptionManager() {
  const {
    subscription,
    billing,
    isLoading,
    error,
    isSubscribed,
    isActive,
    isPaused,
    isCancelled,
    isPastDue,
    canUpgrade,
    canCancel,
    canPause,
    canResume,
    upgradeToProPlan,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
    isCreatingCheckout,
    isCancellingSubscription,
    isPausingSubscription,
    isResumingSubscription,
    checkUsageLimit,
  } = useSubscription();

  const [selectedInterval, setSelectedInterval] = useState<
    'monthly' | 'yearly'
  >('monthly');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Failed to load subscription information
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTier = subscription?.subscription_tier || 'free';
  const tierInfo = SUBSCRIPTION_TIERS[currentTier];

  const handleUpgrade = async () => {
    try {
      await upgradeToProPlan(selectedInterval);
    } catch (error) {
      toast.error('Failed to start upgrade process');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSubscription(true); // Cancel at period end
      toast.success(
        'Subscription will be cancelled at the end of the current period'
      );
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const handlePause = async () => {
    try {
      await pauseSubscription();
      toast.success('Subscription paused successfully');
    } catch (error) {
      toast.error('Failed to pause subscription');
    }
  };

  const handleResume = async () => {
    try {
      await resumeSubscription();
      toast.success('Subscription resumed successfully');
    } catch (error) {
      toast.error('Failed to resume subscription');
    }
  };

  const getStatusBadge = () => {
    if (isPastDue) {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Past Due
        </Badge>
      );
    }
    if (isCancelled) {
      return (
        <Badge variant="secondary">
          <X className="w-3 h-3 mr-1" />
          Cancelled
        </Badge>
      );
    }
    if (isPaused) {
      return (
        <Badge variant="secondary">
          <Pause className="w-3 h-3 mr-1" />
          Paused
        </Badge>
      );
    }
    if (isActive) {
      return (
        <Badge variant="default">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    }
    return <Badge variant="outline">Inactive</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Current Plan: {tierInfo?.name}
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSubscribed && subscription && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Billing Period</div>
                <div className="text-sm text-muted-foreground">
                  {subscription.subscription_current_period_start && (
                    <>
                      {formatDate(
                        subscription.subscription_current_period_start
                      )}{' '}
                      -{' '}
                      {subscription.subscription_current_period_end &&
                        formatDate(
                          subscription.subscription_current_period_end
                        )}
                    </>
                  )}
                </div>
              </div>
              {subscription.subscription_cancelled_at && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Cancellation Date</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(subscription.subscription_cancelled_at)}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {canUpgrade && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedInterval}
                  onChange={(e) =>
                    setSelectedInterval(e.target.value as 'monthly' | 'yearly')
                  }
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly (Save 17%)</option>
                </select>
                <Button
                  onClick={handleUpgrade}
                  disabled={isCreatingCheckout}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  {isCreatingCheckout ? 'Processing...' : 'Upgrade to Pro'}
                </Button>
              </div>
            )}

            {canPause && (
              <Button
                variant="outline"
                onClick={handlePause}
                disabled={isPausingSubscription}
              >
                <Pause className="w-4 h-4 mr-2" />
                {isPausingSubscription ? 'Pausing...' : 'Pause'}
              </Button>
            )}

            {canResume && (
              <Button onClick={handleResume} disabled={isResumingSubscription}>
                <Play className="w-4 h-4 mr-2" />
                {isResumingSubscription ? 'Resuming...' : 'Resume'}
              </Button>
            )}

            {canCancel && (
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isCancellingSubscription}
              >
                <X className="w-4 h-4 mr-2" />
                {isCancellingSubscription ? 'Cancelling...' : 'Cancel'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      {billing && (
        <Card>
          <CardHeader>
            <CardTitle>Usage Overview</CardTitle>
            <CardDescription>
              Current usage for your {tierInfo?.name} plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(billing.usage).map(([key, usage]) => {
              const usageCheck = checkUsageLimit(
                key as keyof typeof billing.usage
              );
              const isUnlimited = usage.limit === -1;

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isUnlimited
                        ? `${usage.used.toLocaleString()} (Unlimited)`
                        : `${usage.used} / ${usage.limit}`}
                    </div>
                  </div>
                  {!isUnlimited && (
                    <div className="space-y-1">
                      <Progress
                        value={usage.percentage}
                        className={`h-2 ${usageCheck.isNearLimit ? 'bg-orange-100' : ''}`}
                      />
                      {usageCheck.isNearLimit && (
                        <div className="text-xs text-orange-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Approaching limit
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Plan Comparison */}
      {!isSubscribed && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade to Pro</CardTitle>
            <CardDescription>
              Unlock unlimited features and advanced capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.values(SUBSCRIPTION_TIERS).map((tier) => (
                <div
                  key={tier.id}
                  className={`p-4 border rounded-lg ${
                    tier.id === 'pro' ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">{tier.name}</h3>
                      <div className="text-2xl font-bold">
                        $
                        {selectedInterval === 'yearly'
                          ? tier.price.yearly
                          : tier.price.monthly}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{selectedInterval === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>
                      {selectedInterval === 'yearly' && tier.id === 'pro' && (
                        <div className="text-sm text-green-600">
                          Save $58/year
                        </div>
                      )}
                    </div>

                    <ul className="space-y-2 text-sm">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {tier.id === 'pro' && (
                      <Button
                        onClick={handleUpgrade}
                        disabled={isCreatingCheckout}
                        className="w-full"
                      >
                        {isCreatingCheckout ? 'Processing...' : 'Upgrade Now'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
