import { PostHog } from 'posthog-node';
import { AnalyticsEvent, ConversionEvent, UserBehaviorData } from '@/types/analytics';

class PostHogAnalytics {
    private client: PostHog | null = null;
    private isInitialized = false;

    constructor() {
        this.initialize();
    }

    private initialize() {
        if (typeof window === 'undefined') {
            // Server-side initialization
            if (process.env.POSTHOG_API_KEY) {
                this.client = new PostHog(process.env.POSTHOG_API_KEY, {
                    host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
                });
                this.isInitialized = true;
            }
        } else {
            // Client-side initialization
            if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
                import('posthog-js').then((posthog) => {
                    posthog.default.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
                        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
                        capture_pageview: false, // We'll handle this manually
                        capture_pageleave: true,
                        loaded: () => {
                            this.isInitialized = true;
                        },
                    });
                });
            }
        }
    }

    // Track events
    async trackEvent(event: AnalyticsEvent): Promise<void> {
        if (!this.isInitialized) return;

        try {
            if (typeof window === 'undefined' && this.client) {
                // Server-side tracking
                this.client.capture({
                    distinctId: event.userId || 'anonymous',
                    event: event.event,
                    properties: {
                        ...event.properties,
                        timestamp: event.timestamp || new Date(),
                        sessionId: event.sessionId,
                    },
                });
            } else if (typeof window !== 'undefined') {
                // Client-side tracking
                const posthog = await import('posthog-js');
                posthog.default.capture(event.event, {
                    ...event.properties,
                    timestamp: event.timestamp || new Date(),
                    sessionId: event.sessionId,
                });
            }
        } catch (error) {
            console.error('Failed to track event:', error);
        }
    }

    // Track page views
    async trackPageView(path: string, title: string, properties?: Record<string, any>): Promise<void> {
        await this.trackEvent({
            event: '$pageview',
            properties: {
                $current_url: path,
                $title: title,
                ...properties,
            },
        });
    }

    // Track user identification
    async identifyUser(userId: string, properties?: Record<string, any>): Promise<void> {
        if (!this.isInitialized) return;

        try {
            if (typeof window === 'undefined' && this.client) {
                this.client.identify({
                    distinctId: userId,
                    properties: properties || {},
                });
            } else if (typeof window !== 'undefined') {
                const posthog = await import('posthog-js');
                posthog.default.identify(userId, properties);
            }
        } catch (error) {
            console.error('Failed to identify user:', error);
        }
    }

    // Track conversion events
    async trackConversion(conversion: ConversionEvent): Promise<void> {
        await this.trackEvent({
            event: `conversion_${conversion.type}`,
            properties: {
                value: conversion.value,
                currency: conversion.currency,
                productId: conversion.productId,
                funnel_step: conversion.funnel_step,
                timestamp: conversion.timestamp,
            },
        });
    }

    // Track user behavior
    async trackUserBehavior(behaviorData: Partial<UserBehaviorData>): Promise<void> {
        await this.trackEvent({
            event: 'user_behavior',
            userId: behaviorData.userId,
            sessionId: behaviorData.sessionId,
            properties: {
                duration: behaviorData.duration,
                bounceRate: behaviorData.bounceRate,
                pageViews: behaviorData.pageViews?.length || 0,
                events: behaviorData.events?.length || 0,
            },
        });
    }

    // Track performance metrics
    async trackPerformance(metrics: Record<string, number>): Promise<void> {
        await this.trackEvent({
            event: 'performance_metrics',
            properties: metrics,
        });
    }

    // Track revenue events
    async trackRevenue(amount: number, currency: string, properties?: Record<string, any>): Promise<void> {
        await this.trackEvent({
            event: 'revenue',
            properties: {
                revenue: amount,
                currency,
                ...properties,
            },
        });
    }

    // Track feature usage
    async trackFeatureUsage(feature: string, properties?: Record<string, any>): Promise<void> {
        await this.trackEvent({
            event: 'feature_used',
            properties: {
                feature,
                ...properties,
            },
        });
    }

    // Track errors
    async trackError(error: Error, context?: Record<string, any>): Promise<void> {
        await this.trackEvent({
            event: 'error',
            properties: {
                error_message: error.message,
                error_stack: error.stack,
                error_name: error.name,
                ...context,
            },
        });
    }

    // Set user properties
    async setUserProperties(userId: string, properties: Record<string, any>): Promise<void> {
        if (!this.isInitialized) return;

        try {
            if (typeof window === 'undefined' && this.client) {
                this.client.identify({
                    distinctId: userId,
                    properties,
                });
            } else if (typeof window !== 'undefined') {
                const posthog = await import('posthog-js');
                posthog.default.people.set(properties);
            }
        } catch (error) {
            console.error('Failed to set user properties:', error);
        }
    }

    // Create cohorts
    async createCohort(name: string, filters: Record<string, any>): Promise<void> {
        await this.trackEvent({
            event: 'cohort_created',
            properties: {
                cohort_name: name,
                filters,
            },
        });
    }

    // Track A/B test participation
    async trackABTest(testName: string, variant: string, userId?: string): Promise<void> {
        await this.trackEvent({
            event: 'ab_test_participation',
            userId,
            properties: {
                test_name: testName,
                variant,
            },
        });
    }

    // Flush events (for server-side)
    async flush(): Promise<void> {
        if (this.client && typeof window === 'undefined') {
            await this.client.flush();
        }
    }

    // Shutdown client
    async shutdown(): Promise<void> {
        if (this.client && typeof window === 'undefined') {
            await this.client.shutdown();
        }
    }
}

// Singleton instance
export const analytics = new PostHogAnalytics();

// Convenience functions
export const trackEvent = (event: AnalyticsEvent) => analytics.trackEvent(event);
export const trackPageView = (path: string, title: string, properties?: Record<string, any>) =>
    analytics.trackPageView(path, title, properties);
export const identifyUser = (userId: string, properties?: Record<string, any>) =>
    analytics.identifyUser(userId, properties);
export const trackConversion = (conversion: ConversionEvent) => analytics.trackConversion(conversion);
export const trackRevenue = (amount: number, currency: string, properties?: Record<string, any>) =>
    analytics.trackRevenue(amount, currency, properties);
export const trackFeatureUsage = (feature: string, properties?: Record<string, any>) =>
    analytics.trackFeatureUsage(feature, properties);
export const trackError = (error: Error, context?: Record<string, any>) =>
    analytics.trackError(error, context);