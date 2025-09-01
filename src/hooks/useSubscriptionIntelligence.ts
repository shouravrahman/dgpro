import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
    SubscriptionIntelligence,
    SubscriptionRecommendation,
    ChurnRiskAssessment,
    PersonalizedOffer,
    DynamicPricing,
    UsageBasedBilling,
    OptimizationSuggestion,
    IntelligenceRequest,
    OptimizationRequest,
    ChurnPredictionRequest,
    PersonalizedOffersRequest,
} from '@/types/subscription-intelligence';

interface UseSubscriptionIntelligenceOptions {
    includeRecommendations?: boolean;
    includeChurnAnalysis?: boolean;
    includePersonalizedOffers?: boolean;
    includeDynamicPricing?: boolean;
    timeframe?: 'week' | 'month' | 'quarter' | 'year';
}

export function useSubscriptionIntelligence(options: UseSubscriptionIntelligenceOptions = {}) {
    const queryClient = useQueryClient();

    // Get comprehensive subscription intelligence
    const {
        data: intelligence,
        isLoading: isLoadingIntelligence,
        error: intelligenceError,
        refetch: refetchIntelligence,
    } = useQuery<SubscriptionIntelligence>({
        queryKey: ['subscription-intelligence', options],
        queryFn: async () => {
            const params = new URLSearchParams({
                includeRecommendations: String(options.includeRecommendations ?? true),
                includeChurnAnalysis: String(options.includeChurnAnalysis ?? true),
                includePersonalizedOffers: String(options.includePersonalizedOffers ?? true),
                includeDynamicPricing: String(options.includeDynamicPricing ?? false),
                timeframe: options.timeframe ?? 'month',
            });

            const response = await fetch(`/api/subscription-intelligence?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch subscription intelligence');
            }
            const result = await response.json();
            return result.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });

    // Generate custom intelligence
    const generateIntelligenceMutation = useMutation({
        mutationFn: async (request: IntelligenceRequest) => {
            const response = await fetch('/api/subscription-intelligence', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to generate intelligence');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription-intelligence'] });
        },
    });

    return {
        // Data
        intelligence,

        // Loading states
        isLoadingIntelligence,
        isLoading: isLoadingIntelligence,

        // Errors
        intelligenceError,
        error: intelligenceError,

        // Actions
        refetchIntelligence,
        generateIntelligence: generateIntelligenceMutation.mutateAsync,

        // Action states
        isGeneratingIntelligence: generateIntelligenceMutation.isPending,
    };
}

export function useSubscriptionRecommendations() {
    const queryClient = useQueryClient();

    // Get subscription recommendations
    const {
        data: recommendations,
        isLoading: isLoadingRecommendations,
        error: recommendationsError,
    } = useQuery({
        queryKey: ['subscription-recommendations'],
        queryFn: async () => {
            const response = await fetch('/api/subscription-intelligence/recommendations');
            if (!response.ok) {
                throw new Error('Failed to fetch recommendations');
            }
            const result = await response.json();
            return result.data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Get optimized recommendations
    const getOptimizedRecommendationsMutation = useMutation({
        mutationFn: async (request: OptimizationRequest) => {
            const response = await fetch('/api/subscription-intelligence/recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to get optimized recommendations');
            }

            return response.json();
        },
    });

    return {
        // Data
        recommendations,

        // Loading states
        isLoadingRecommendations,
        isLoading: isLoadingRecommendations,

        // Errors
        recommendationsError,
        error: recommendationsError,

        // Actions
        getOptimizedRecommendations: getOptimizedRecommendationsMutation.mutateAsync,

        // Action states
        isGettingOptimizedRecommendations: getOptimizedRecommendationsMutation.isPending,
    };
}

export function useChurnPrediction() {
    const queryClient = useQueryClient();

    // Get churn risk assessment
    const {
        data: churnRisk,
        isLoading: isLoadingChurnRisk,
        error: churnRiskError,
    } = useQuery<ChurnRiskAssessment>({
        queryKey: ['churn-prediction'],
        queryFn: async () => {
            const response = await fetch('/api/subscription-intelligence/churn-prediction');
            if (!response.ok) {
                throw new Error('Failed to fetch churn prediction');
            }
            const result = await response.json();
            return result.data.churnRisk;
        },
        staleTime: 15 * 60 * 1000, // 15 minutes
    });

    // Get detailed churn analysis
    const getDetailedChurnAnalysisMutation = useMutation({
        mutationFn: async (request: ChurnPredictionRequest) => {
            const response = await fetch('/api/subscription-intelligence/churn-prediction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to get detailed churn analysis');
            }

            return response.json();
        },
    });

    return {
        // Data
        churnRisk,

        // Loading states
        isLoadingChurnRisk,
        isLoading: isLoadingChurnRisk,

        // Errors
        churnRiskError,
        error: churnRiskError,

        // Actions
        getDetailedChurnAnalysis: getDetailedChurnAnalysisMutation.mutateAsync,

        // Action states
        isGettingDetailedAnalysis: getDetailedChurnAnalysisMutation.isPending,
    };
}

export function usePersonalizedOffers() {
    const queryClient = useQueryClient();

    // Get personalized offers
    const {
        data: offers,
        isLoading: isLoadingOffers,
        error: offersError,
    } = useQuery<PersonalizedOffer[]>({
        queryKey: ['personalized-offers'],
        queryFn: async () => {
            const response = await fetch('/api/subscription-intelligence/personalized-offers');
            if (!response.ok) {
                throw new Error('Failed to fetch personalized offers');
            }
            const result = await response.json();
            return result.data.offers;
        },
        staleTime: 30 * 60 * 1000, // 30 minutes
    });

    // Generate targeted offers
    const generateTargetedOffersMutation = useMutation({
        mutationFn: async (request: PersonalizedOffersRequest) => {
            const response = await fetch('/api/subscription-intelligence/personalized-offers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to generate targeted offers');
            }

            return response.json();
        },
    });

    // Accept/decline offer
    const handleOfferMutation = useMutation({
        mutationFn: async ({ offerId, action }: { offerId: string; action: 'accepted' | 'declined' | 'viewed' }) => {
            const response = await fetch('/api/subscription-intelligence/personalized-offers', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ offerId, action }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to handle offer');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['personalized-offers'] });
        },
    });

    return {
        // Data
        offers,

        // Loading states
        isLoadingOffers,
        isLoading: isLoadingOffers,

        // Errors
        offersError,
        error: offersError,

        // Actions
        generateTargetedOffers: generateTargetedOffersMutation.mutateAsync,
        acceptOffer: (offerId: string) => handleOfferMutation.mutateAsync({ offerId, action: 'accepted' }),
        declineOffer: (offerId: string) => handleOfferMutation.mutateAsync({ offerId, action: 'declined' }),
        viewOffer: (offerId: string) => handleOfferMutation.mutateAsync({ offerId, action: 'viewed' }),

        // Action states
        isGeneratingTargetedOffers: generateTargetedOffersMutation.isPending,
        isHandlingOffer: handleOfferMutation.isPending,
    };
}

export function useUsageOptimization() {
    const queryClient = useQueryClient();

    // Get usage optimization suggestions
    const {
        data: optimization,
        isLoading: isLoadingOptimization,
        error: optimizationError,
    } = useQuery({
        queryKey: ['usage-optimization'],
        queryFn: async () => {
            const response = await fetch('/api/subscription-intelligence/usage-optimization');
            if (!response.ok) {
                throw new Error('Failed to fetch usage optimization');
            }
            const result = await response.json();
            return result.data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Get targeted optimization recommendations
    const getTargetedOptimizationMutation = useMutation({
        mutationFn: async (request: {
            optimizationType?: 'cost' | 'efficiency' | 'features' | 'workflow';
            timeframe?: 'week' | 'month' | 'quarter' | 'year';
            includeProjections?: boolean;
        }) => {
            const response = await fetch('/api/subscription-intelligence/usage-optimization', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to get targeted optimization');
            }

            return response.json();
        },
    });

    return {
        // Data
        optimization,

        // Loading states
        isLoadingOptimization,
        isLoading: isLoadingOptimization,

        // Errors
        optimizationError,
        error: optimizationError,

        // Actions
        getTargetedOptimization: getTargetedOptimizationMutation.mutateAsync,

        // Action states
        isGettingTargetedOptimization: getTargetedOptimizationMutation.isPending,
    };
}

// Combined hook for comprehensive subscription intelligence
export function useComprehensiveIntelligence() {
    const intelligence = useSubscriptionIntelligence();
    const recommendations = useSubscriptionRecommendations();
    const churnPrediction = useChurnPrediction();
    const personalizedOffers = usePersonalizedOffers();
    const usageOptimization = useUsageOptimization();

    const isLoading =
        intelligence.isLoading ||
        recommendations.isLoading ||
        churnPrediction.isLoading ||
        personalizedOffers.isLoading ||
        usageOptimization.isLoading;

    const hasError =
        intelligence.error ||
        recommendations.error ||
        churnPrediction.error ||
        personalizedOffers.error ||
        usageOptimization.error;

    return {
        // Combined data
        data: {
            intelligence: intelligence.intelligence,
            recommendations: recommendations.recommendations,
            churnRisk: churnPrediction.churnRisk,
            offers: personalizedOffers.offers,
            optimization: usageOptimization.optimization,
        },

        // Combined loading state
        isLoading,

        // Combined error state
        error: hasError,

        // Individual hooks for granular control
        intelligence,
        recommendations,
        churnPrediction,
        personalizedOffers,
        usageOptimization,

        // Refresh all data
        refetchAll: async () => {
            await Promise.all([
                intelligence.refetchIntelligence(),
                queryClient.invalidateQueries({ queryKey: ['subscription-recommendations'] }),
                queryClient.invalidateQueries({ queryKey: ['churn-prediction'] }),
                queryClient.invalidateQueries({ queryKey: ['personalized-offers'] }),
                queryClient.invalidateQueries({ queryKey: ['usage-optimization'] }),
            ]);
        },
    };
}

// Utility hook for subscription intelligence insights
export function useIntelligenceInsights() {
    const { data, isLoading, error } = useComprehensiveIntelligence();

    const insights = {
        // Overall health score
        healthScore: data.churnRisk ? 100 - data.churnRisk.score : 100,

        // Optimization opportunities
        optimizationOpportunities: data.optimization?.optimizations?.length || 0,

        // Potential savings
        potentialSavings: data.recommendations?.recommendations
            ?.filter(r => r.potentialSavings)
            ?.reduce((sum, r) => sum + (r.potentialSavings || 0), 0) || 0,

        // Potential value
        potentialValue: data.recommendations?.recommendations
            ?.filter(r => r.potentialValue)
            ?.reduce((sum, r) => sum + (r.potentialValue || 0), 0) || 0,

        // Active offers count
        activeOffers: data.offers?.length || 0,

        // High priority recommendations
        highPriorityRecommendations: data.recommendations?.recommendations
            ?.filter(r => r.urgency === 'high')?.length || 0,

        // Usage efficiency
        usageEfficiency: data.intelligence?.usagePatterns ?
            calculateOverallUsageEfficiency(data.intelligence.usagePatterns) : 0,
    };

    return {
        insights,
        isLoading,
        error,
    };
}

// Helper function to calculate overall usage efficiency
function calculateOverallUsageEfficiency(usagePatterns: any): number {
    const metrics = [
        usagePatterns.aiRequests,
        usagePatterns.products,
        usagePatterns.marketplaceListings,
        usagePatterns.fileUploads,
    ];

    const efficiencyScores = metrics.map(metric => {
        if (metric.limit === -1) return 100; // Unlimited = 100% efficient
        return Math.min(100, (metric.current / metric.limit) * 100);
    });

    return Math.round(efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length);
}