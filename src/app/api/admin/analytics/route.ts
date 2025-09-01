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

        // Parse filters from query parameters
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

        // Add optional filters
        if (searchParams.get('user_segment')) {
            filters.userSegment = searchParams.get('user_segment')!;
        }
        if (searchParams.get('source')) {
            filters.source = searchParams.get('source')!;
        }
        if (searchParams.get('device')) {
            filters.device = searchParams.get('device')!;
        }
        if (searchParams.get('country')) {
            filters.country = searchParams.get('country')!;
        }
        if (searchParams.get('product_category')) {
            filters.productCategory = searchParams.get('product_category')!;
        }

        const dashboardData = await analyticsService.getDashboardData(filters);

        return NextResponse.json({
            success: true,
            data: dashboardData,
        });
    } catch (error) {
        console.error('Admin Analytics API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        );
    }
}