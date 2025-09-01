import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AffiliateService } from '@/lib/services/affiliate';
import { affiliateUpdateSchema } from '@/lib/validations/affiliate';

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
        const affiliate = await affiliateService.getAffiliate(user.id);

        if (!affiliate) {
            return NextResponse.json(
                { success: false, error: { message: 'Affiliate not found', code: 'NOT_FOUND' } },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: affiliate,
        });
    } catch (error) {
        console.error('Error fetching affiliate:', error);
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

export async function PUT(request: NextRequest) {
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
        const validatedData = affiliateUpdateSchema.parse(body);

        const affiliateService = new AffiliateService();
        const affiliate = await affiliateService.updateAffiliate(user.id, validatedData);

        return NextResponse.json({
            success: true,
            data: affiliate,
        });
    } catch (error) {
        console.error('Error updating affiliate:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Internal server error',
                    code: 'UPDATE_ERROR'
                }
            },
            { status: 500 }
        );
    }
}