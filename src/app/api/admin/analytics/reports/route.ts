import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/analytics/analytics-service';
import { validateApiKey } from '@/lib/auth/api-validation';

export async function GET(request: NextRequest) {
    try {
        // Validate API key and admin role
        const validation = await validateApiKey(request);
        if (!validation.isValid) {
            return NextResponse.json({ error: validation.error }, { status: 401 });
        }

        // Check if user is admin
        if (!validation.user?.role || validation.user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const reports = await analyticsService.getCustomReports();

        return NextResponse.json({
            success: true,
            data: reports,
        });
    } catch (error) {
        console.error('Admin Reports API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reports' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Validate API key and admin role
        const validation = await validateApiKey(request);
        if (!validation.isValid) {
            return NextResponse.json({ error: validation.error }, { status: 401 });
        }

        // Check if user is admin
        if (!validation.user?.role || validation.user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();

        // Validate required fields
        const { name, description, metrics, dimensions, filters, format, recipients } = body;

        if (!name || !metrics || !dimensions || !format) {
            return NextResponse.json(
                { error: 'Missing required fields: name, metrics, dimensions, format' },
                { status: 400 }
            );
        }

        const report = await analyticsService.createCustomReport({
            name,
            description: description || '',
            metrics,
            dimensions,
            filters: filters || {
                dateRange: {
                    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    end: new Date(),
                },
            },
            format,
            recipients: recipients || [],
            schedule: body.schedule,
        });

        return NextResponse.json({
            success: true,
            data: report,
        });
    } catch (error) {
        console.error('Create admin report API error:', error);
        return NextResponse.json(
            { error: 'Failed to create report' },
            { status: 500 }
        );
    }
}