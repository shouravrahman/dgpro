'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    AnalyticsDashboardData,
    AnalyticsFilters,
    CustomReport,
    UserInsights,
} from '@/types/analytics';

export function useAdminAnalytics() {
    const [dashboardData, setDashboardData] = useState<AnalyticsDashboardData | null>(null);
    const [userInsights, setUserInsights] = useState<UserInsights | null>(null);
    const [customReports, setCustomReports] = useState<CustomReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load admin dashboard data
    const loadDashboardData = useCallback(async (filters?: AnalyticsFilters) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (filters?.dateRange?.start) {
                params.append('start_date', filters.dateRange.start.toISOString());
            }
            if (filters?.dateRange?.end) {
                params.append('end_date', filters.dateRange.end.toISOString());
            }
            if (filters?.userSegment) {
                params.append('user_segment', filters.userSegment);
            }
            if (filters?.source) {
                params.append('source', filters.source);
            }
            if (filters?.device) {
                params.append('device', filters.device);
            }
            if (filters?.country) {
                params.append('country', filters.country);
            }
            if (filters?.productCategory) {
                params.append('product_category', filters.productCategory);
            }

            const response = await fetch(`/api/admin/analytics/dashboard?${params}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to load analytics data');
            }

            setDashboardData(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    // Load custom reports
    const loadCustomReports = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/admin/analytics/reports');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to load custom reports');
            }

            setCustomReports(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load custom reports');
        } finally {
            setLoading(false);
        }
    }, []);

    // Create custom report
    const createCustomReport = useCallback(async (report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/admin/analytics/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(report),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create custom report');
            }

            setCustomReports(prev => [result.data, ...prev]);
            return result.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create custom report');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Export data
    const exportData = useCallback(async (format: 'csv' | 'json' | 'pdf', filters?: AnalyticsFilters) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/admin/analytics/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    format,
                    filters,
                }),
            });

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `admin-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
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
    }, []);

    // Auto-load dashboard data on mount
    useEffect(() => {
        loadDashboardData();
        loadCustomReports();
    }, [loadDashboardData, loadCustomReports]);

    return {
        // State
        dashboardData,
        userInsights,
        customReports,
        loading,
        error,

        // Actions
        loadDashboardData,
        loadCustomReports,
        createCustomReport,
        exportData,

        // Utility functions
        refresh: () => {
            loadDashboardData();
            loadCustomReports();
        },
        clearError: () => setError(null),
    };
}