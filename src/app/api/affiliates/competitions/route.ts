import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AffiliateService } from '@/lib/services/affiliate';
import {
    competitionCreateSchema,
    competitionQuerySchema
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

        const validatedQuery = competitionQuerySchema.parse(queryParams);

        const affiliateService = new AffiliateService();
        const result = await affiliateService.getCompetitions(validatedQuery);

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Error fetching competitions:', error);
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

        // Check if user is admin (you might want to implement proper admin check)
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: { message: 'Forbidden', code: 'FORBIDDEN' } },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validatedData = competitionCreateSchema.parse(body);

        const affiliateService = new AffiliateService();
        const competition = await affiliateService.createCompetition(validatedData);

        return NextResponse.json({
            success: true,
            data: competition,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating competition:', error);
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