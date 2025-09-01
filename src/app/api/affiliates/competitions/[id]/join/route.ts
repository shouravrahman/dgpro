import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AffiliateService } from '@/lib/services/affiliate';

export async function POST(
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

        const affiliateService = new AffiliateService();

        // Get user's affiliate account
        const affiliate = await affiliateService.getAffiliate(user.id);
        if (!affiliate) {
            return NextResponse.json(
                { success: false, error: { message: 'Affiliate account required', code: 'NO_AFFILIATE' } },
                { status: 400 }
            );
        }

        // Check if competition exists and is active
        const { data: competition } = await supabase
            .from('affiliate_competitions')
            .select('status, start_date, end_date')
            .eq('id', competitionId)
            .single();

        if (!competition) {
            return NextResponse.json(
                { success: false, error: { message: 'Competition not found', code: 'NOT_FOUND' } },
                { status: 404 }
            );
        }

        if (competition.status !== 'active' && competition.status !== 'upcoming') {
            return NextResponse.json(
                { success: false, error: { message: 'Competition is not available for joining', code: 'INVALID_STATUS' } },
                { status: 400 }
            );
        }

        // Check if already joined
        const { data: existingParticipant } = await supabase
            .from('competition_participants')
            .select('id')
            .eq('competition_id', competitionId)
            .eq('affiliate_id', affiliate.id)
            .single();

        if (existingParticipant) {
            return NextResponse.json(
                { success: false, error: { message: 'Already joined this competition', code: 'ALREADY_JOINED' } },
                { status: 409 }
            );
        }

        const participant = await affiliateService.joinCompetition(competitionId, affiliate.id);

        return NextResponse.json({
            success: true,
            data: participant,
        }, { status: 201 });
    } catch (error) {
        console.error('Error joining competition:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Internal server error',
                    code: 'JOIN_ERROR'
                }
            },
            { status: 500 }
        );
    }
}