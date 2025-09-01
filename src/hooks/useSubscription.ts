import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { BillingInfo, SubscriptionTier } from '@/types/payments';

interface SubscriptionData {
    subscription_tier: string;
    subscription_status: string;
    lemonsqueezy_subscription_id: string | null;
    lemonsqueezy_customer_id: string | null;
    subscription_current_period_start: string | null;
    subscription_current_period_end: string | null;
    subscription_cancelled_at: string | null;
    subscription_paused_at: string | null;
    lemonSqueezyData?: any;
}

interface CreateCheckoutParams {
    tier: 'pro';
    interval: 'monthly' | 'yearly';
    successUrl: string;
    cancelUrl?: string;
}

interface UpdateSubscriptionParams {
    tier: 'pro';
    interval: 'monthly' | 'yearly';
}

export function useSubscription() {
    const queryClient = useQueryClient();

    // Get subscription details
    const {
        data: subscription,
        isLoading: isLoadingSubscription,
        error: subscriptionError,
    } = useQuery<SubscriptionData>({
        queryKey: ['subscription'],
        queryFn: async () => {
            const response = await fetch('/api/subscriptions');
            if (!response.ok) {
                throw new Error('Failed to fetch subscription');
            }
            const result = await response.json();
            return result.data;
        },
    });

    // Get billing information and usage
    const {
        data: billing,
        isLoading: isLoadingBilling,
        error: billingError,
    } = useQuery<BillingInfo>({
        queryKey: ['billing'],
        queryFn: async () => {
            const response = await fetch('/api/billing');
            if (!response.ok) {
                throw new Error('Failed to fetch billing information');
            }
            const result = await response.json();
            return result.data;
        },
    });

    // Create checkout session
    const createCheckoutMutation = useMutation({
        mutationFn: async (params: CreateCheckoutParams) => {
            const response = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create checkout session');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
            queryClient.invalidateQueries({ queryKey: ['billing'] });
        },
    });

    // Update subscription
    const updateSubscriptionMutation = useMutation({
        mutationFn: async (params: UpdateSubscriptionParams) => {
            const response = await fetch('/api/subscriptions', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update subscription');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
            queryClient.invalidateQueries({ queryKey: ['billing'] });
        },
    });

    // Cancel subscription
    const cancelSubscriptionMutation = useMutation({
        mutationFn: async (cancelAtPeriodEnd: boolean = true) => {
            const response = await fetch(`/api/subscriptions?cancelAtPeriodEnd=${cancelAtPeriodEnd}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to cancel subscription');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
            queryClient.invalidateQueries({ queryKey: ['billing'] });
        },
    });

    // Pause subscription
    const pauseSubscriptionMutation = useMutation({
        mutationFn: async (resumeAt?: string) => {
            const response = await fetch('/api/subscriptions/pause', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ resumeAt }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to pause subscription');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
            queryClient.invalidateQueries({ queryKey: ['billing'] });
        },
    });

    // Resume subscription
    const resumeSubscriptionMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/subscriptions/resume', {
                method: 'POST',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to resume subscription');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
            queryClient.invalidateQueries({ queryKey: ['billing'] });
        },
    });

    // Helper functions
    const isSubscribed = subscription?.subscription_tier === 'pro';
    const isActive = subscription?.subscription_status === 'active';
    const isPaused = subscription?.subscription_status === 'paused';
    const isCancelled = subscription?.subscription_status === 'cancelled';
    const isPastDue = subscription?.subscription_status === 'past_due';

    const canUpgrade = !isSubscribed || subscription?.subscription_tier === 'free';
    const canCancel = isSubscribed && isActive && !isCancelled;
    const canPause = isSubscribed && isActive && !isPaused;
    const canResume = isSubscribed && isPaused;

    // Usage limit checking
    const checkUsageLimit = (type: keyof BillingInfo['usage']) => {
        if (!billing) return { canUse: true, isNearLimit: false, percentage: 0 };

        const usage = billing.usage[type];
        const canUse = usage.limit === -1 || usage.used < usage.limit;
        const isNearLimit = usage.limit !== -1 && usage.percentage >= 80;

        return {
            canUse,
            isNearLimit,
            percentage: usage.percentage,
            used: usage.used,
            limit: usage.limit,
        };
    };

    // Create checkout and redirect
    const upgradeToProPlan = async (interval: 'monthly' | 'yearly') => {
        try {
            const result = await createCheckoutMutation.mutateAsync({
                tier: 'pro',
                interval,
                successUrl: `${window.location.origin}/dashboard?upgraded=true`,
                cancelUrl: `${window.location.origin}/dashboard`,
            });

            if (result.success && result.data.checkoutUrl) {
                window.location.href = result.data.checkoutUrl;
            }
        } catch (error) {
            console.error('Failed to create checkout:', error);
            throw error;
        }
    };

    return {
        // Data
        subscription,
        billing,

        // Loading states
        isLoadingSubscription,
        isLoadingBilling,
        isLoading: isLoadingSubscription || isLoadingBilling,

        // Errors
        subscriptionError,
        billingError,
        error: subscriptionError || billingError,

        // Status checks
        isSubscribed,
        isActive,
        isPaused,
        isCancelled,
        isPastDue,

        // Action availability
        canUpgrade,
        canCancel,
        canPause,
        canResume,

        // Actions
        upgradeToProPlan,
        createCheckout: createCheckoutMutation.mutateAsync,
        updateSubscription: updateSubscriptionMutation.mutateAsync,
        cancelSubscription: cancelSubscriptionMutation.mutateAsync,
        pauseSubscription: pauseSubscriptionMutation.mutateAsync,
        resumeSubscription: resumeSubscriptionMutation.mutateAsync,

        // Action states
        isCreatingCheckout: createCheckoutMutation.isPending,
        isUpdatingSubscription: updateSubscriptionMutation.isPending,
        isCancellingSubscription: cancelSubscriptionMutation.isPending,
        isPausingSubscription: pauseSubscriptionMutation.isPending,
        isResumingSubscription: resumeSubscriptionMutation.isPending,

        // Utility functions
        checkUsageLimit,
    };
}

// Subscription tier definitions
export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
    free: {
        id: 'free',
        name: 'Free',
        price: {
            monthly: 0,
            yearly: 0,
        },
        features: [
            '10 AI requests per month',
            '3 products',
            '1 marketplace listing',
            '5 file uploads',
            '100MB storage',
            'Basic support',
        ],
        limits: {
            aiRequests: 10,
            products: 3,
            marketplaceListings: 1,
            fileUploads: 5,
            storage: '100MB',
        },
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: {
            monthly: 29,
            yearly: 290, // 2 months free
        },
        features: [
            'Unlimited AI requests',
            'Unlimited products',
            'Unlimited marketplace listings',
            'Unlimited file uploads',
            '10GB storage',
            'Priority support',
            'Advanced analytics',
            'Custom branding',
            'Bulk operations',
        ],
        limits: {
            aiRequests: -1,
            products: -1,
            marketplaceListings: -1,
            fileUploads: -1,
            storage: '10GB',
        },
    },
};