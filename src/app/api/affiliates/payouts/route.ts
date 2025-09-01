import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AffiliateService } from '@/lib/services/affiliate';
import { payoutRequestSchema } from '@/lib/validations/affiliate';

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
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

        const payouts = await affiliateService.getPayouts(affiliate.id);

        return NextResponse.json({
            success: true,
            data: payouts,
        });
    } catch (error) {
        console.error('Error fetching payouts:', error);
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

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = payoutRequestSchema.parse(body);

        const affiliateService = new AffiliateService();

        // Get user's affiliate account
        const affiliate = await affiliateService.getAffiliate(user.id);
        if (!affiliate) {
            return NextResponse.json(
                { success: false, error: { message: 'Affiliate not found', code: 'NOT_FOUND' } },
                { status: 404 }
            );
        }

        // Check if affiliate has enough earnings
        if (affiliate.totalEarnings < validatedData.amount) {
            return NextResponse.json(
                { success: false, error: { message: 'Insufficient earnings', code: 'INSUFFICIENT_FUNDS' } },
                { status: 400 }
            );
        }

        // Check minimum payout amount (e.g., $50)
        const minimumPayout = 50;
        if (validatedData.amount < minimumPayout) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: `Minimum payout amount is $${minimumPayout}`,
                        code: 'MINIMUM_PAYOUT'
                    }
                },
                { status: 400 }
            );
        }

        const payout = await affiliateService.requestPayout(affiliate.id, validatedData);

        return NextResponse.json({
            success: true,
            data: payout,
        }, { status: 201 });
    } catch (error) {
        console.error('Error requesting payout:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Internal server error',
                    code: 'PAYOUT_ERROR'
                }
            },
            { status: 500 }
        );
    }
}