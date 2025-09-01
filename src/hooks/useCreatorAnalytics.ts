'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    CreatorAnalyticsData,
    CreatorAnalyticsFilters,
    CreatorGoal,
    CreatorInsight,
    CreatorRecommendation,
} from '@/types/creator-analytics';

export function useCreatorAnalytics(creatorId?: string) {
    const [analyticsData, setAnalyticsData] = useState<CreatorAnalyticsData | null>(null);
    const [insights, setInsights] = useState<CreatorInsight[]>([]);
    const [recommendations, setRecommendations] = useState<CreatorRecommendation[]>([]);
    const [goals, setGoals] = useState<CreatorGoal[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load creator analytics data
    const loadAnalyticsData = useCallback(async (filters?: CreatorAnalyticsFilters) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (creatorId) {
                params.append('creator_id', creatorId);
            }
            if (filters?.dateRange?.start) {
                params.append('start_date', filters.dateRange.start.toISOString());
            }
            if (filters?.dateRange?.end) {
                params.append('end_date', filters.dateRange.end.toISOString());
            }
            if (filters?.productCategory) {
                params.append('product_category', filters.productCategory);
            }
            if (filters?.productStatus) {
                params.append('product_status', filters.productStatus);
            }
            if (filters?.metric) {
                params.append('metric', filters.metric);
            }

            const response = await fetch(`/api/creator/analytics?${params}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to load analytics data');
            }

            setAnalyticsData(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    }, [creatorId]);

    // Load insights, recommendations, and goals
    const loadInsights = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (creatorId) {
                params.append('creator_id', creatorId);
            }

            const response = await fetch(`/api/creator/analytics/insights?${params}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to load insights');
            }

            setInsights(result.data.insights);
            setRecommendations(result.data.recommendations);
            setGoals(result.data.goals);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load insights');
        } finally {
            setLoading(false);
        }
    }, [creatorId]);

    // Create a new goal
    const createGoal = useCallback(async (goalData: Omit<CreatorGoal, 'id' | 'status'>) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/creator/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'create_goal',
                    ...goalData,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create goal');
            }

            // Refresh goals
            await loadInsights();

            return result.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create goal');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadInsights]);

    // Update an existing goal
    const updateGoal = useCallback(async (goalId: string, updates: Partial<CreatorGoal>) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/creator/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'update_goal',
                    id: goalId,
                    ...updates,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update goal');
            }

            // Refresh goals
            await loadInsights();

            return result.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update goal');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadInsights]);

    // Export analytics data
    const exportData = useCallback(async (format: 'csv' | 'json' | 'pdf', filters?: CreatorAnalyticsFilters) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/creator/analytics/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    format,
                    filters,
                    creator_id: creatorId,
                }),
            });

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `creator-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to export data');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [creatorId]);

    // Auto-load data on mount
    useEffect(() => {
        loadAnalyticsData();
        loadInsights();
    }, [loadAnalyticsData, loadInsights]);

    return {
        // State
        analyticsData,
        insights,
        recommendations,
        goals,
        loading,
        error,

        // Actions
        loadAnalyticsData,
        loadInsights,
        createGoal,
        updateGoal,
        exportData,

        // Utility functions
        refresh: () => {
            loadAnalyticsData();
            loadInsights();
        },
        clearError: () => setError(null),
    };
}

// Hook for tracking creator-specific events
export function useCreatorTracking() {
    const trackCreatorEvent = useCallback(async (event: string, properties?: Record<string, any>) => {
        try {
            await fetch('/api/analytics/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: `creator_${event}`,
                    properties: {
                        ...properties,
                        timestamp: new Date().toISOString(),
                    },
                }),
            });
        } catch (error) {
            console.error('Failed to track creator event:', error);
        }
    }, []);

    const trackProductView = useCallback((productId: string, creatorId: string) => {
        trackCreatorEvent('product_view', { productId, creatorId });
    }, [trackCreatorEvent]);

    const trackProductPurchase = useCallback((productId: string, creatorId: string, amount: number) => {
        trackCreatorEvent('product_purchase', { productId, creatorId, amount });
    }, [trackCreatorEvent]);

    const trackProfileView = useCallback((creatorId: string) => {
        trackCreatorEvent('profile_view', { creatorId });
    }, [trackCreatorEvent]);

    const trackFollowAction = useCallback((creatorId: string, action: 'follow' | 'unfollow') => {
        trackCreatorEvent('follow_action', { creatorId, action });
    }, [trackCreatorEvent]);

    return {
        trackCreatorEvent,
        trackProductView,
        trackProductPurchase,
        trackProfileView,
        trackFollowAction,
    };
}