import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AffiliateService } from '@/lib/services/affiliate';
import { referralQuerySchema } from '@/lib/validations/affiliate';

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

        const { searchParams } = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());

        const affiliateService = new AffiliateService();

        // Get user's affiliate account
        const affiliate = await affiliateService.getAffiliate(user.id);
        if (!affiliate) {
            return NextResponse.json(
                { success: false, error: { message: 'Affiliate not found', code: 'NOT_FOUND' } },
                { status: 404 }
            );
        }

        // Add affiliate ID to query
        queryParams.affiliateId = affiliate.id;
        const validatedQuery = referralQuerySchema.parse(queryParams);

        const result = await affiliateService.getReferrals(validatedQuery);

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Error fetching referrals:', error);
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