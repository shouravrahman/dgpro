import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AffiliateService } from '@/lib/services/affiliate';
import { analyticsQuerySchema } from '@/lib/validations/affiliate';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
                { status: 401 }
            );
        }

        const affiliateService = new AffiliateService();

        // Get user's affiliate account
        const affiliate = await affiliateService.getAffiliate(user.id);
        if (!affiliate) {
            return NextResponse.json(
                { success: false, error: { message: 'Affiliate not found', code: 'NOT_FOUND' } },
                { status: 404 }
            );
        }

        // Get stats
        const stats = await affiliateService.getAffiliateStats(affiliate.id);

        // Get performance metrics
        const { searchParams } = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());
        const validatedQuery = analyticsQuerySchema.parse(queryParams);

        const metrics = await affiliateService.getPerformanceMetrics(affiliate.id, validatedQuery);

        return NextResponse.json({
            success: true,
            data: {
                stats,
                metrics,
            },
        });
    } catch (error) {
        console.error('Error fetching affiliate stats:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Internal server error',
                    code: 'FETCH_ERROR'
                }
            },
            { status: 500 }
        );
    }
}