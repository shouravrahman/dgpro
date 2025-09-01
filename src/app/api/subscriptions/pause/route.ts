import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { lemonSqueezyClient } from '@/lib/lemonsqueezy/client';
import { z } from 'zod';

const PauseSubscriptionSchema = z.object({
    resumeAt: z.string().datetime().optional(),
});

// POST /api/subscriptions/pause - Pause subscription
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

        const body = await request.json();
        const validatedData = PauseSubscriptionSchema.parse(body);

        // Get user's current subscription
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('lemonsqueezy_subscription_id, subscription_status')
            .eq('id', user.id)
            .single();

        if (userError || !userData?.lemonsqueezy_subscription_id) {
            return NextResponse.json(
                { error: 'No active subscription found' },
                { status: 404 }
            );
        }

        if (userData.subscription_status !== 'active') {
            return NextResponse.json(
                { error: 'Subscription must be active to pause' },
                { status: 400 }
            );
        }

        // Pause subscription in LemonSqueezy
        const pauseResult = await lemonSqueezyClient.pauseSubscription(
            userData.lemonsqueezy_subscription_id,
            validatedData.resumeAt
        );

        if (!pauseResult.success) {
            return NextResponse.json(
                { error: pauseResult.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: pauseResult.data,
        });
    } catch (error) {
        console.error('Subscription pause error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}