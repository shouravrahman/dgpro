import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AffiliateService } from '@/lib/services/affiliate';
import {
    affiliateRegistrationSchema,
    affiliateQuerySchema
} from '@/lib/validations/affiliate';

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

        const validatedQuery = affiliateQuerySchema.parse(queryParams);

        const affiliateService = new AffiliateService();
        const result = await affiliateService.getAffiliates(validatedQuery);

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Error fetching affiliates:', error);
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
        const validatedData = affiliateRegistrationSchema.parse(body);

        const affiliateService = new AffiliateService();

        // Check if user already has an affiliate account
        const existingAffiliate = await affiliateService.getAffiliate(user.id);
        if (existingAffiliate) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: 'User already has an affiliate account',
                        code: 'ALREADY_EXISTS'
                    }
                },
                { status: 409 }
            );
        }

        const affiliate = await affiliateService.createAffiliate(user.id, validatedData);

        return NextResponse.json({
            success: true,
            data: affiliate,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating affiliate:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Internal server error',
                    code: 'CREATE_ERROR'
                }
            },
            { status: 500 }
        );
    }
}