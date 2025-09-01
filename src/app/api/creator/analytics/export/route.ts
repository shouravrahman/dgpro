import { NextRequest, NextResponse } from 'next/server';
import { creatorAnalyticsService } from '@/lib/analytics/creator-analytics-service';
import { createClient } from '@/lib/supabase/server';
import { CreatorAnalyticsFilters } from '@/types/creator-analytics';

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { format, filters, creator_id } = body;
        const creatorId = creator_id || user.id;

        // Verify user can access this creator's data
        if (creatorId !== user.id) {
            const { data: userRole } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            if (!userRole || userRole.role !== 'admin') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        if (!format || !['csv', 'json', 'pdf'].includes(format)) {
            return NextResponse.json(
                { error: 'Invalid format. Must be csv, json, or pdf' },
                { status: 400 }
            );
        }

        // Parse filters
        const creatorFilters: CreatorAnalyticsFilters = {
            dateRange: {
                start: filters?.dateRange?.start
                    ? new Date(filters.dateRange.start)
                    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                end: filters?.dateRange?.end
                    ? new Date(filters.dateRange.end)
                    : new Date(),
            },
            productCategory: filters?.productCategory,
            productStatus: filters?.productStatus,
            metric: filters?.metric,
        };

        // Get creator analytics data
        const analyticsData = await creatorAnalyticsService.getCreatorAnalytics(creatorId, creatorFilters);

        // Convert to export format
        let exportedData: string;
        switch (format) {
            case 'json':
                exportedData = JSON.stringify(analyticsData, null, 2);
                break;
            case 'csv':
                exportedData = this.convertToCSV(analyticsData);
                break;
            case 'pdf':
                exportedData = 'PDF export not implemented yet';
                break;
            default:
                throw new Error('Unsupported format');
        }

        // Set appropriate headers based on format
        const headers: Record<string, string> = {
            'Content-Disposition': `attachment; filename="creator-analytics-${creatorId}-${new Date().toISOString().split('T')[0]}.${format}"`,
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
        console.error('Creator Export API error:', error);
        return NextResponse.json(
            { error: 'Failed to export creator analytics data' },
            { status: 500 }
        );
    }
}

// Helper method to convert analytics data to CSV
function convertToCSV(data: any): string {
    const csvRows = [];

    // Add overview data
    csvRows.push('Overview');
    csvRows.push('Metric,Value');
    csvRows.push(`Total Revenue,${data.overview?.totalRevenue || 0}`);
    csvRows.push(`Total Sales,${data.overview?.totalSales || 0}`);
    csvRows.push(`Total Products,${data.overview?.totalProducts || 0}`);
    csvRows.push(`Followers,${data.overview?.followerCount || 0}`);
    csvRows.push('');

    // Add product data
    if (data.products?.topProducts?.length > 0) {
        csvRows.push('Top Products');
        csvRows.push('Name,Category,Price,Sales,Revenue');
        data.products.topProducts.forEach((product: any) => {
            csvRows.push(`${product.name},${product.category},${product.price},${product.sales},${product.revenue}`);
        });
        csvRows.push('');
    }

    // Add revenue data
    if (data.revenue?.revenueByMonth?.length > 0) {
        csvRows.push('Monthly Revenue');
        csvRows.push('Month,Revenue,Sales,Growth');
        data.revenue.revenueByMonth.forEach((month: any) => {
            csvRows.push(`${month.month},${month.revenue},${month.sales},${month.growth}`);
        });
    }

    return csvRows.join('\n');
}
}