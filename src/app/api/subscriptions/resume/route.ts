import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { lemonSqueezyClient } from '@/lib/lemonsqueezy/client';

// POST /api/subscriptions/resume - Resume paused subscription
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user's current subscription
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('lemonsqueezy_subscription_id, subscription_status')
            .eq('id', user.id)
            .single();

        if (userError || !userData?.lemonsqueezy_subscription_id) {
            return NextResponse.json(
                { error: 'No subscription found' },
                { status: 404 }
            );
        }

        if (userData.subscription_status !== 'paused') {
            return NextResponse.json(
                { error: 'Subscription must be paused to resume' },
                { status: 400 }
            );
        }

        // Resume subscription in LemonSqueezy
        const resumeResult = await lemonSqueezyClient.resumeSubscription(
            userData.lemonsqueezy_subscription_id
        );

        if (!resumeResult.success) {
            return NextResponse.json(
                { error: resumeResult.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: resumeResult.data,
        });
    } catch (error) {
        console.error('Subscription resume error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}