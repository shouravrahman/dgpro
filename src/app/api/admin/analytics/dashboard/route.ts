import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/analytics/analytics-service';
import { validateApiKey } from '@/lib/auth/api-validation';
import { AnalyticsFilters } from '@/types/analytics';

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

        const { searchParams } = new URL(request.url);

        // Parse filters
        const filters: AnalyticsFilters = {
            dateRange: {
                start: searchParams.get('start_date')
                    ? new Date(searchParams.get('start_date')!)
                    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                end: searchParams.get('end_date')
                    ? new Date(searchParams.get('end_date')!)
                    : new Date(),
            },
        };

        // Get platform-wide dashboard data for admins
        const dashboardData = await analyticsService.getDashboardData(filters);

        return NextResponse.json({
            success: true,
            data: dashboardData,
            filters,
        });
    } catch (error) {
        console.error('Admin Dashboard API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}