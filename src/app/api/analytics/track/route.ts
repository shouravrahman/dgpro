import { NextRequest, NextResponse } from 'next/server';
import { analytics } from '@/lib/analytics/posthog';
import { AnalyticsEvent } from '@/types/analytics';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { event, properties, userId, sessionId } = body;

        if (!event) {
            return NextResponse.json(
                { error: 'Event name is required' },
                { status: 400 }
            );
        }

        const analyticsEvent: AnalyticsEvent = {
            event,
            properties: properties || {},
            userId,
            sessionId,
            timestamp: new Date(),
        };

        // Track the event with PostHog
        await analytics.trackEvent(analyticsEvent);

        return NextResponse.json({
            success: true,
            message: 'Event tracked successfully',
        });
    } catch (error) {
        console.error('Track API error:', error);
        return NextResponse.json(
            { error: 'Failed to track event' },
            { status: 500 }
        );
    }
}

// Handle page view tracking
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { path, title, properties, userId } = body;

        if (!path) {
            return NextResponse.json(
                { error: 'Page path is required' },
                { status: 400 }
            );
        }

        // Track page view with PostHog
        await analytics.trackPageView(path, title || path, {
            ...properties,
            userId,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            message: 'Page view tracked successfully',
        });
    } catch (error) {
        console.error('Page view tracking error:', error);
        return NextResponse.json(
            { error: 'Failed to track page view' },
            { status: 500 }
        );
    }
}