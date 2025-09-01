import { NextRequest, NextResponse } from 'next/server';
import { creatorAnalyticsService } from '@/lib/analytics/creator-analytics-service';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const creatorId = searchParams.get('creator_id') || user.id;

        // Verify user can access this creator's insights
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

        const [insights, recommendations, goals] = await Promise.all([
            creatorAnalyticsService.getCreatorInsights(creatorId),
            creatorAnalyticsService.getCreatorRecommendations(creatorId),
            creatorAnalyticsService.getCreatorGoals(creatorId),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                insights,
                recommendations,
                goals,
            },
        });
    } catch (error) {
        console.error('Creator Insights API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch creator insights' },
            { status: 500 }
        );
    }
}