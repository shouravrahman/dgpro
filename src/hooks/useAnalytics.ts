'use client';

import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '@/lib/analytics/analytics-service';
import { trackEvent, trackPageView, identifyUser, trackConversion, trackRevenue } from '@/lib/analytics/posthog';
import {
    AnalyticsDashboardData,
    AnalyticsFilters,
    CustomReport,
    UserInsights,
    AnalyticsEvent,
    ConversionEvent,
} from '@/types/analytics';

export function useAnalytics() {
    const [dashboardData, setDashboardData] = useState<AnalyticsDashboardData | null>(null);
    const [userInsights, setUserInsights] = useState<UserInsights | null>(null);
    const [customReports, setCustomReports] = useState<CustomReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load dashboard data
    const loadDashboardData = useCallback(async (filters?: AnalyticsFilters) => {
        try {
            setLoading(true);
            setError(null);
            const data = await analyticsService.getDashboardData(filters);
            setDashboardData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    // Load user insights
    const loadUserInsights = useCallback(async (filters?: AnalyticsFilters) => {
        try {
            setLoading(true);
            setError(null);
            const data = await analyticsService.getUserInsights(filters);
            setUserInsights(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load user insights');
        } finally {
            setLoading(false);
        }
    }, []);

    // Load custom reports
    const loadCustomReports = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const reports = await analyticsService.getCustomReports();
            setCustomReports(reports);
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
            const newReport = await analyticsService.createCustomReport(report);
            setCustomReports(prev => [newReport, ...prev]);
            return newReport;
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
            const exportedData = await analyticsService.exportData(format, filters);

            // Create download link
            const blob = new Blob([exportedData], {
                type: format === 'json' ? 'application/json' : format === 'csv' ? 'text/csv' : 'application/pdf'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            return exportedData;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to export data');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Track event wrapper
    const track = useCallback(async (event: AnalyticsEvent) => {
        try {
            await trackEvent(event);
        } catch (err) {
            console.error('Failed to track event:', err);
        }
    }, []);

    // Track page view wrapper
    const trackPage = useCallback(async (path: string, title: string, properties?: Record<string, any>) => {
        try {
            await trackPageView(path, title, properties);
        } catch (err) {
            console.error('Failed to track page view:', err);
        }
    }, []);

    // Identify user wrapper
    const identify = useCallback(async (userId: string, properties?: Record<string, any>) => {
        try {
            await identifyUser(userId, properties);
        } catch (err) {
            console.error('Failed to identify user:', err);
        }
    }, []);

    // Track conversion wrapper
    const trackConversionEvent = useCallback(async (conversion: ConversionEvent) => {
        try {
            await trackConversion(conversion);
        } catch (err) {
            console.error('Failed to track conversion:', err);
        }
    }, []);

    // Track revenue wrapper
    const trackRevenueEvent = useCallback(async (amount: number, currency: string, properties?: Record<string, any>) => {
        try {
            await trackRevenue(amount, currency, properties);
        } catch (err) {
            console.error('Failed to track revenue:', err);
        }
    }, []);

    // Auto-load dashboard data on mount
    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    return {
        // State
        dashboardData,
        userInsights,
        customReports,
        loading,
        error,

        // Actions
        loadDashboardData,
        loadUserInsights,
        loadCustomReports,
        createCustomReport,
        exportData,

        // Tracking functions
        track,
        trackPage,
        identify,
        trackConversionEvent,
        trackRevenueEvent,

        // Utility functions
        refresh: () => {
            loadDashboardData();
            loadUserInsights();
            loadCustomReports();
        },
        clearError: () => setError(null),
    };
}

// Hook for tracking page views automatically
export function usePageTracking() {
    useEffect(() => {
        const handleRouteChange = () => {
            trackPageView(window.location.pathname, document.title);
        };

        // Track initial page load
        handleRouteChange();

        // Listen for route changes (for client-side navigation)
        window.addEventListener('popstate', handleRouteChange);

        return () => {
            window.removeEventListener('popstate', handleRouteChange);
        };
    }, []);
}

// Hook for tracking user behavior
export function useUserBehaviorTracking() {
    const { track } = useAnalytics();

    const trackClick = useCallback((element: string, properties?: Record<string, any>) => {
        track({
            event: 'click',
            properties: {
                element,
                ...properties,
            },
        });
    }, [track]);

    const trackFormSubmit = useCallback((formName: string, properties?: Record<string, any>) => {
        track({
            event: 'form_submit',
            properties: {
                form_name: formName,
                ...properties,
            },
        });
    }, [track]);

    const trackSearch = useCallback((query: string, results: number, properties?: Record<string, any>) => {
        track({
            event: 'search',
            properties: {
                query,
                results,
                ...properties,
            },
        });
    }, [track]);

    const trackDownload = useCallback((fileName: string, fileType: string, properties?: Record<string, any>) => {
        track({
            event: 'download',
            properties: {
                file_name: fileName,
                file_type: fileType,
                ...properties,
            },
        });
    }, [track]);

    const trackVideoPlay = useCallback((videoId: string, duration: number, properties?: Record<string, any>) => {
        track({
            event: 'video_play',
            properties: {
                video_id: videoId,
                duration,
                ...properties,
            },
        });
    }, [track]);

    return {
        trackClick,
        trackFormSubmit,
        trackSearch,
        trackDownload,
        trackVideoPlay,
    };
}

// Hook for performance tracking
export function usePerformanceTracking() {
    const { track } = useAnalytics();

    useEffect(() => {
        // Track Core Web Vitals
        if (typeof window !== 'undefined' && 'performance' in window) {
            // Track page load time
            window.addEventListener('load', () => {
                const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                if (navigation) {
                    track({
                        event: 'performance_metrics',
                        properties: {
                            page_load_time: navigation.loadEventEnd - navigation.loadEventStart,
                            dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                            first_byte: navigation.responseStart - navigation.requestStart,
                        },
                    });
                }
            });

            // Track Web Vitals if available
            if ('web-vitals' in window) {
                import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                    getCLS((metric) => track({ event: 'web_vital_cls', properties: { value: metric.value } }));
                    getFID((metric) => track({ event: 'web_vital_fid', properties: { value: metric.value } }));
                    getFCP((metric) => track({ event: 'web_vital_fcp', properties: { value: metric.value } }));
                    getLCP((metric) => track({ event: 'web_vital_lcp', properties: { value: metric.value } }));
                    getTTFB((metric) => track({ event: 'web_vital_ttfb', properties: { value: metric.value } }));
                }).catch(() => {
                    // web-vitals not available
                });
            }
        }
    }, [track]);
}