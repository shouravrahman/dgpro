'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
    Affiliate,
    AffiliateStats,
    AffiliateReferral,
    AffiliateCompetition,
    AffiliateLeaderboard,
    AffiliatePayout,
    AffiliateRegistrationInput,
    AffiliateUpdateInput,
    PayoutRequestInput,
    ReferralQueryInput,
    CompetitionQueryInput,
    AnalyticsQueryInput,
} from '@/types/affiliate';

// API functions
const affiliateApi = {
    // Get current user's affiliate profile
    getMyAffiliate: async (): Promise<Affiliate> => {
        const response = await fetch('/api/affiliates/me');
        const result = await response.json();
        if (!result.success) throw new Error(result.error.message);
        return result.data;
    },

    // Create affiliate account
    createAffiliate: async (data: AffiliateRegistrationInput): Promise<Affiliate> => {
        const response = await fetch('/api/affiliates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error.message);
        return result.data;
    },

    // Update affiliate profile
    updateAffiliate: async (data: AffiliateUpdateInput): Promise<Affiliate> => {
        const response = await fetch('/api/affiliates/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error.message);
        return result.data;
    },

    // Get affiliate stats and metrics
    getStats: async (query?: AnalyticsQueryInput) => {
        const params = new URLSearchParams(query as any);
        const response = await fetch(`/api/affiliates/stats?${params}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error.message);
        return result.data;
    },

    // Get referrals
    getReferrals: async (query?: ReferralQueryInput) => {
        const params = new URLSearchParams(query as any);
        const response = await fetch(`/api/affiliates/referrals?${params}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error.message);
        return result.data;
    },

    // Get competitions
    getCompetitions: async (query?: CompetitionQueryInput) => {
        const params = new URLSearchParams(query as any);
        const response = await fetch(`/api/affiliates/competitions?${params}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error.message);
        return result.data;
    },

    // Join competition
    joinCompetition: async (competitionId: string) => {
        const response = await fetch(`/api/affiliates/competitions/${competitionId}/join`, {
            method: 'POST',
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error.message);
        return result.data;
    },

    // Get competition leaderboard
    getLeaderboard: async (competitionId: string) => {
        const response = await fetch(`/api/affiliates/competitions/${competitionId}/leaderboard`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error.message);
        return result.data;
    },

    // Get payouts
    getPayouts: async (): Promise<AffiliatePayout[]> => {
        const response = await fetch('/api/affiliates/payouts');
        const result = await response.json();
        if (!result.success) throw new Error(result.error.message);
        return result.data;
    },

    // Request payout
    requestPayout: async (data: PayoutRequestInput): Promise<AffiliatePayout> => {
        const response = await fetch('/api/affiliates/payouts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error.message);
        return result.data;
    },
};

// Main hook
export function useAffiliate() {
    const queryClient = useQueryClient();

    // Get affiliate profile
    const {
        data: affiliate,
        isLoading: isLoadingAffiliate,
        error: affiliateError,
    } = useQuery({
        queryKey: ['affiliate', 'me'],
        queryFn: affiliateApi.getMyAffiliate,
        retry: false,
    });

    // Create affiliate mutation
    const createAffiliateMutation = useMutation({
        mutationFn: affiliateApi.createAffiliate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['affiliate'] });
        },
    });

    // Update affiliate mutation
    const updateAffiliateMutation = useMutation({
        mutationFn: affiliateApi.updateAffiliate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['affiliate'] });
        },
    });

    return {
        affiliate,
        isLoadingAffiliate,
        affiliateError,
        createAffiliate: createAffiliateMutation.mutate,
        updateAffiliate: updateAffiliateMutation.mutate,
        isCreating: createAffiliateMutation.isPending,
        isUpdating: updateAffiliateMutation.isPending,
    };
}

// Hook for affiliate stats
export function useAffiliateStats(query?: AnalyticsQueryInput) {
    return useQuery({
        queryKey: ['affiliate', 'stats', query],
        queryFn: () => affiliateApi.getStats(query),
        enabled: !!query || true,
    });
}

// Hook for referrals
export function useAffiliateReferrals(query?: ReferralQueryInput) {
    return useQuery({
        queryKey: ['affiliate', 'referrals', query],
        queryFn: () => affiliateApi.getReferrals(query),
    });
}

// Hook for competitions
export function useAffiliateCompetitions(query?: CompetitionQueryInput) {
    const queryClient = useQueryClient();

    const {
        data: competitions,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['affiliate', 'competitions', query],
        queryFn: () => affiliateApi.getCompetitions(query),
    });

    const joinCompetitionMutation = useMutation({
        mutationFn: affiliateApi.joinCompetition,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['affiliate', 'competitions'] });
        },
    });

    return {
        competitions,
        isLoading,
        error,
        joinCompetition: joinCompetitionMutation.mutate,
        isJoining: joinCompetitionMutation.isPending,
    };
}

// Hook for competition leaderboard
export function useCompetitionLeaderboard(competitionId: string) {
    return useQuery({
        queryKey: ['affiliate', 'leaderboard', competitionId],
        queryFn: () => affiliateApi.getLeaderboard(competitionId),
        enabled: !!competitionId,
    });
}

// Hook for payouts
export function useAffiliatePayouts() {
    const queryClient = useQueryClient();

    const {
        data: payouts,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['affiliate', 'payouts'],
        queryFn: affiliateApi.getPayouts,
    });

    const requestPayoutMutation = useMutation({
        mutationFn: affiliateApi.requestPayout,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['affiliate', 'payouts'] });
            queryClient.invalidateQueries({ queryKey: ['affiliate', 'stats'] });
        },
    });

    return {
        payouts,
        isLoading,
        error,
        requestPayout: requestPayoutMutation.mutate,
        isRequesting: requestPayoutMutation.isPending,
    };
}

// Utility hook for generating affiliate links
export function useAffiliateLinks() {
    const { affiliate } = useAffiliate();

    const generateLink = (productId?: string, baseUrl?: string) => {
        if (!affiliate?.affiliateCode) return null;

        const url = new URL(baseUrl || window.location.origin);
        url.searchParams.set('ref', affiliate.affiliateCode);
        if (productId) {
            url.searchParams.set('product', productId);
        }

        return url.toString();
    };

    const generateShareText = (productName?: string) => {
        if (!productName) return 'Check out this amazing product!';
        return `Check out ${productName} - I think you'll love it!`;
    };

    return {
        generateLink,
        generateShareText,
        affiliateCode: affiliate?.affiliateCode,
    };
}