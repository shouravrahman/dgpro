import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/analytics/analytics-service';
import { validateApiKey } from '@/lib/auth/api-validation';
import { AnalyticsFilters } from '@/types/analytics';

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
        const { format, filters } = body;

        if (!format || !['csv', 'json', 'pdf'].includes(format)) {
            return NextResponse.json(
                { error: 'Invalid format. Must be csv, json, or pdf' },
                { status: 400 }
            );
        }

        // Parse filters
        const analyticsFilters: AnalyticsFilters = {
            dateRange: {
                start: filters?.dateRange?.start
                    ? new Date(filters.dateRange.start)
                    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                end: filters?.dateRange?.end
                    ? new Date(filters.dateRange.end)
                    : new Date(),
            },
            userSegment: filters?.userSegment,
            source: filters?.source,
            device: filters?.device,
            country: filters?.country,
            productCategory: filters?.productCategory,
        };

        const exportedData = await analyticsService.exportData(format, analyticsFilters);

        // Set appropriate headers based on format
        const headers: Record<string, string> = {
            'Content-Disposition': `attachment; filename="admin-analytics-export-${new Date().toISOString().split('T')[0]}.${format}"`,
        };

        switch (format) {
            case 'csv':
                headers['Content-Type'] = 'text/csv';
                break;
            case 'json':
                headers['Content-Type'] = 'application/json';
                break;
            case 'pdf':
                headers['Content-Type'] = 'application/pdf';
                break;
        }

        return new NextResponse(exportedData, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error('Admin Export API error:', error);
        return NextResponse.json(
            { error: 'Failed to export analytics data' },
            { status: 500 }
        );
    }
}