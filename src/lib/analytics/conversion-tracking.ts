'use client';

// Conversion tracking utilities for landing page optimization
export interface ConversionEvent {
    event: string;
    category: string;
    label?: string;
    value?: number;
    userId?: string;
    properties?: Record<string, any>;
}

class ConversionTracker {
    private isInitialized = false;

    initialize() {
        if (this.isInitialized) return;

        // Initialize analytics services
        this.initializeGoogleAnalytics();
        this.initializeHotjar();
        this.initializePlausible();

        this.isInitialized = true;
    }

    private initializeGoogleAnalytics() {
        // Google Analytics 4 initialization
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
                page_title: document.title,
                page_location: window.location.href,
            });
        }
    }

    private initializeHotjar() {
        // Hotjar is initialized in layout.tsx
        if (typeof window !== 'undefined' && window.hj) {
            window.hj('identify', null, {
                landing_page: window.location.pathname,
                timestamp: new Date().toISOString(),
            });
        }
    }

    private initializePlausible() {
        // Plausible is initialized in layout.tsx
        if (typeof window !== 'undefined' && window.plausible) {
            window.plausible('pageview');
        }
    }

    // Track conversion events
    track(event: ConversionEvent) {
        if (!this.isInitialized) {
            this.initialize();
        }

        // Google Analytics 4
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', event.event, {
                event_category: event.category,
                event_label: event.label,
                value: event.value,
                custom_parameters: event.properties,
            });
        }

        // Plausible Analytics
        if (typeof window !== 'undefined' && window.plausible) {
            window.plausible(event.event, {
                props: {
                    category: event.category,
                    label: event.label,
                    ...event.properties,
                },
            });
        }

        // Hotjar Events
        if (typeof window !== 'undefined' && window.hj) {
            window.hj('event', event.event);
        }

        // Console log for development
        if (process.env.NODE_ENV === 'development') {
            console.log('Conversion Event:', event);
        }
    }

    // Predefined conversion events
    trackSignup(method: string = 'email', properties?: Record<string, any>) {
        this.track({
            event: 'sign_up',
            category: 'engagement',
            label: method,
            properties: {
                method,
                ...properties,
            },
        });
    }

    trackLogin(method: string = 'email', properties?: Record<string, any>) {
        this.track({
            event: 'login',
            category: 'engagement',
            label: method,
            properties: {
                method,
                ...properties,
            },
        });
    }

    trackPurchase(value: number, currency: string = 'USD', properties?: Record<string, any>) {
        this.track({
            event: 'purchase',
            category: 'ecommerce',
            value,
            properties: {
                currency,
                ...properties,
            },
        });
    }

    trackSubscription(tier: string, value: number, properties?: Record<string, any>) {
        this.track({
            event: 'subscribe',
            category: 'ecommerce',
            label: tier,
            value,
            properties: {
                tier,
                ...properties,
            },
        });
    }

    trackCTAClick(ctaName: string, location: string, properties?: Record<string, any>) {
        this.track({
            event: 'cta_click',
            category: 'engagement',
            label: `${ctaName}_${location}`,
            properties: {
                cta_name: ctaName,
                location,
                ...properties,
            },
        });
    }

    trackVideoPlay(videoName: string, properties?: Record<string, any>) {
        this.track({
            event: 'video_play',
            category: 'engagement',
            label: videoName,
            properties: {
                video_name: videoName,
                ...properties,
            },
        });
    }

    trackFormSubmit(formName: string, properties?: Record<string, any>) {
        this.track({
            event: 'form_submit',
            category: 'engagement',
            label: formName,
            properties: {
                form_name: formName,
                ...properties,
            },
        });
    }

    trackPageView(pageName: string, properties?: Record<string, any>) {
        this.track({
            event: 'page_view',
            category: 'navigation',
            label: pageName,
            properties: {
                page_name: pageName,
                ...properties,
            },
        });
    }

    trackScrollDepth(depth: number, properties?: Record<string, any>) {
        this.track({
            event: 'scroll_depth',
            category: 'engagement',
            label: `${depth}%`,
            value: depth,
            properties: {
                depth,
                ...properties,
            },
        });
    }

    trackTimeOnPage(seconds: number, properties?: Record<string, any>) {
        this.track({
            event: 'time_on_page',
            category: 'engagement',
            value: seconds,
            properties: {
                seconds,
                ...properties,
            },
        });
    }

    // A/B Testing support
    trackExperiment(experimentName: string, variant: string, properties?: Record<string, any>) {
        this.track({
            event: 'experiment_view',
            category: 'experiment',
            label: `${experimentName}_${variant}`,
            properties: {
                experiment_name: experimentName,
                variant,
                ...properties,
            },
        });
    }
}

// Global instance
export const conversionTracker = new ConversionTracker();

// React hook for conversion tracking
export function useConversionTracking() {
    return {
        track: conversionTracker.track.bind(conversionTracker),
        trackSignup: conversionTracker.trackSignup.bind(conversionTracker),
        trackLogin: conversionTracker.trackLogin.bind(conversionTracker),
        trackPurchase: conversionTracker.trackPurchase.bind(conversionTracker),
        trackSubscription: conversionTracker.trackSubscription.bind(conversionTracker),
        trackCTAClick: conversionTracker.trackCTAClick.bind(conversionTracker),
        trackVideoPlay: conversionTracker.trackVideoPlay.bind(conversionTracker),
        trackFormSubmit: conversionTracker.trackFormSubmit.bind(conversionTracker),
        trackPageView: conversionTracker.trackPageView.bind(conversionTracker),
        trackScrollDepth: conversionTracker.trackScrollDepth.bind(conversionTracker),
        trackTimeOnPage: conversionTracker.trackTimeOnPage.bind(conversionTracker),
        trackExperiment: conversionTracker.trackExperiment.bind(conversionTracker),
    };
}

// Scroll depth tracking utility
export function initializeScrollTracking() {
    if (typeof window === 'undefined') return;

    let maxScroll = 0;
    const thresholds = [25, 50, 75, 90, 100];
    const tracked = new Set<number>();

    const handleScroll = () => {
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );

        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;

            // Track threshold crossings
            thresholds.forEach((threshold) => {
                if (scrollPercent >= threshold && !tracked.has(threshold)) {
                    tracked.add(threshold);
                    conversionTracker.trackScrollDepth(threshold);
                }
            });
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
}

// Time on page tracking
export function initializeTimeTracking() {
    if (typeof window === 'undefined') return;

    const startTime = Date.now();
    const intervals = [30, 60, 120, 300]; // 30s, 1m, 2m, 5m
    const tracked = new Set<number>();

    const checkTime = () => {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000);

        intervals.forEach((interval) => {
            if (timeOnPage >= interval && !tracked.has(interval)) {
                tracked.add(interval);
                conversionTracker.trackTimeOnPage(interval);
            }
        });
    };

    const intervalId = setInterval(checkTime, 5000); // Check every 5 seconds

    // Track final time on page visibility change
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
            const finalTime = Math.round((Date.now() - startTime) / 1000);
            conversionTracker.trackTimeOnPage(finalTime, { final: true });
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
        clearInterval(intervalId);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
}

// Declare global types for analytics
declare global {
    interface Window {
        gtag: (...args: any[]) => void;
        hj: (...args: any[]) => void;
        plausible: (event: string, options?: { props?: Record<string, any> }) => void;
    }
}