import { NextRequest, NextResponse } from 'next/server';
import { creatorAnalyticsService } from '@/lib/analytics/creator-analytics-service';
import { createClient } from '@/lib/supabase/server';
import { CreatorAnalyticsFilters } from '@/types/creator-analytics';

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

        // Verify user can access this creator's analytics
        if (creatorId !== user.id) {
            // Check if user is admin or has permission to view this creator's data
            const { data: userRole } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            if (!userRole || userRole.role !== 'admin') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        // Parse filters from query parameters
        const filters: CreatorAnalyticsFilters = {
            dateRange: {
                start: searchParams.get('start_date')
                    ? new Date(searchParams.get('start_date')!)
                    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                end: searchParams.get('end_date')
                    ? new Date(searchParams.get('end_date')!)
                    : new Date(),
            },
        };

        // Add optional filters
        if (searchParams.get('product_category')) {
            filters.productCategory = searchParams.get('product_category')!;
        }
        if (searchParams.get('product_status')) {
            filters.productStatus = searchParams.get('product_status') as 'active' | 'draft' | 'archived';
        }
        if (searchParams.get('metric')) {
            filters.metric = searchParams.get('metric')!;
        }

        const analyticsData = await creatorAnalyticsService.getCreatorAnalytics(creatorId, filters);

        return NextResponse.json({
            success: true,
            data: analyticsData,
        });
    } catch (error) {
        console.error('Creator Analytics API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch creator analytics data' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, ...data } = body;

        switch (action) {
            case 'create_goal':
                // Create a new creator goal
                const { data: goal, error: goalError } = await supabase
                    .from('creator_goals')
                    .insert({
                        creator_id: user.id,
                        name: data.name,
                        type: data.type,
                        target: data.target,
                        current: data.current || 0,
                        deadline: data.deadline,
                        status: 'active',
                    })
                    .select()
                    .single();

                if (goalError) throw goalError;

                return NextResponse.json({ success: true, data: goal });

            case 'update_goal':
                // Update an existing goal
                const { data: updatedGoal, error: updateError } = await supabase
                    .from('creator_goals')
                    .update({
                        name: data.name,
                        target: data.target,
                        current: data.current,
                        deadline: data.deadline,
                        status: data.status,
                    })
                    .eq('id', data.id)
                    .eq('creator_id', user.id)
                    .select()
                    .single();

                if (updateError) throw updateError;

                return NextResponse.json({ success: true, data: updatedGoal });

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Creator Analytics API error:', error);
        return NextResponse.json(
            { error: 'Failed to process creator analytics request' },
            { status: 500 }
        );
    }
}