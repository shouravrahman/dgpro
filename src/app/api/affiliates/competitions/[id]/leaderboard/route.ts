import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AffiliateService } from '@/lib/services/affiliate';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
                { status: 401 }
            );
        }

        const competitionId = params.id;

        // Check if competition exists
        const { data: competition } = await supabase
            .from('affiliate_competitions')
            .select('id, name, status')
            .eq('id', competitionId)
            .single();

        if (!competition) {
            return NextResponse.json(
                { success: false, error: { message: 'Competition not found', code: 'NOT_FOUND' } },
                { status: 404 }
            );
        }

        const affiliateService = new AffiliateService();
        const leaderboard = await affiliateService.getCompetitionLeaderboard(competitionId);

        return NextResponse.json({
            success: true,
            data: {
                competition,
                leaderboard,
            },
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
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