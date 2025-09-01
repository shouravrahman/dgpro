import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { lemonSqueezyClient } from '@/lib/lemonsqueezy/client';
import { validateLemonSqueezyConfig } from '@/lib/lemonsqueezy/config';
import { z } from 'zod';

// Validate environment on startup
try {
    validateLemonSqueezyConfig();
} catch (error) {
    console.error('LemonSqueezy configuration error:', error);
}

const CreateCheckoutSchema = z.object({
    tier: z.enum(['pro']),
    interval: z.enum(['monthly', 'yearly']),
    successUrl: z.string().url(),
    cancelUrl: z.string().url().optional(),
});

const UpdateSubscriptionSchema = z.object({
    tier: z.enum(['pro']),
    interval: z.enum(['monthly', 'yearly']),
});

// GET /api/subscriptions - Get user's subscription details
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user's subscription details from database
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select(`
        subscription_tier,
        subscription_status,
        lemonsqueezy_subscription_id,
        lemonsqueezy_customer_id,
        subscription_current_period_start,
        subscription_current_period_end,
        subscription_cancelled_at,
        subscription_paused_at
      `)
            .eq('id', user.id)
            .single();

        if (userError) {
            console.error('Failed to get user subscription:', userError);
            return NextResponse.json(
                { error: 'Failed to get subscription details' },
                { status: 500 }
            );
        }

        // If user has a LemonSqueezy subscription, get latest details
        let lemonSqueezyData = null;
        if (userData.lemonsqueezy_subscription_id) {
            const result = await lemonSqueezyClient.getSubscriptionDetails(
                userData.lemonsqueezy_subscription_id
            );
            if (result.success) {
                lemonSqueezyData = result.data;
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                ...userData,
                lemonSqueezyData,
            },
        });
    } catch (error) {
        console.error('Subscription GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/subscriptions - Create checkout session for subscription
export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = CreateCheckoutSchema.parse(body);

        // Get user details
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', user.id)
            .single();

        if (userError || !userData) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get the variant ID for the selected tier and interval
        const variantId = lemonSqueezyClient.getSubscriptionVariantId(
            validatedData.tier,
            validatedData.interval
        );

        if (!variantId) {
            return NextResponse.json(
                { error: 'Invalid subscription plan' },
                { status: 400 }
            );
        }

        // Create checkout session
        const checkoutResult = await lemonSqueezyClient.createCheckoutSession({
            variantId,
            userId: user.id,
            customerEmail: userData.email,
            customerName: userData.full_name || userData.email,
            productType: 'subscription',
            productName: `${validatedData.tier.charAt(0).toUpperCase() + validatedData.tier.slice(1)} Plan - ${validatedData.interval}`,
            productDescription: `AI Product Creator ${validatedData.tier} subscription (${validatedData.interval} billing)`,
            successUrl: validatedData.successUrl,
            metadata: {
                tier: validatedData.tier,
                interval: validatedData.interval,
                user_id: user.id,
            },
        });

        if (!checkoutResult.success) {
            return NextResponse.json(
                { error: checkoutResult.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: checkoutResult.data,
        });
    } catch (error) {
        console.error('Subscription POST error:', error);

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

// PUT /api/subscriptions - Update existing subscription
export async function PUT(request: NextRequest) {
    try {
        const supabase = createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = UpdateSubscriptionSchema.parse(body);

        // Get user's current subscription
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('lemonsqueezy_subscription_id, subscription_tier')
            .eq('id', user.id)
            .single();

        if (userError || !userData?.lemonsqueezy_subscription_id) {
            return NextResponse.json(
                { error: 'No active subscription found' },
                { status: 404 }
            );
        }

        // Get new variant ID
        const newVariantId = lemonSqueezyClient.getSubscriptionVariantId(
            validatedData.tier,
            validatedData.interval
        );

        if (!newVariantId) {
            return NextResponse.json(
                { error: 'Invalid subscription plan' },
                { status: 400 }
            );
        }

        // Update subscription in LemonSqueezy
        const updateResult = await lemonSqueezyClient.updateSubscriptionPlan(
            userData.lemonsqueezy_subscription_id,
            newVariantId
        );

        if (!updateResult.success) {
            return NextResponse.json(
                { error: updateResult.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updateResult.data,
        });
    } catch (error) {
        console.error('Subscription PUT error:', error);

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

// DELETE /api/subscriptions - Cancel subscription
export async function DELETE(request: NextRequest) {
    try {
        const supabase = createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const cancelAtPeriodEnd = url.searchParams.get('cancelAtPeriodEnd') !== 'false';

        // Get user's current subscription
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('lemonsqueezy_subscription_id')
            .eq('id', user.id)
            .single();

        if (userError || !userData?.lemonsqueezy_subscription_id) {
            return NextResponse.json(
                { error: 'No active subscription found' },
                { status: 404 }
            );
        }

        // Cancel subscription in LemonSqueezy
        const cancelResult = await lemonSqueezyClient.cancelSubscriptionPlan(
            userData.lemonsqueezy_subscription_id,
            cancelAtPeriodEnd
        );

        if (!cancelResult.success) {
            return NextResponse.json(
                { error: cancelResult.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: cancelResult.data,
        });
    } catch (error) {
        console.error('Subscription DELETE error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}