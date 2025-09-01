import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { LEMONSQUEEZY_CONFIG } from '@/lib/lemonsqueezy/config';
import type { WebhookEvent } from '@/types/payments';

// Verify webhook signature
function verifyWebhookSignature(payload: string, signature: string): boolean {
    const hmac = crypto.createHmac('sha256', LEMONSQUEEZY_CONFIG.webhookSecret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
    );
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing webhook signature' },
                { status: 400 }
            );
        }

        // Verify webhook signature
        if (!verifyWebhookSignature(body, signature)) {
            return NextResponse.json(
                { error: 'Invalid webhook signature' },
                { status: 401 }
            );
        }

        const event: WebhookEvent = JSON.parse(body);
        const supabase = await createClient();

        // Handle different webhook events
        switch (event.meta.event_name) {
            case 'subscription_created':
                await handleSubscriptionCreated(event, supabase);
                break;

            case 'subscription_updated':
                await handleSubscriptionUpdated(event, supabase);
                break;

            case 'subscription_cancelled':
                await handleSubscriptionCancelled(event, supabase);
                break;

            case 'subscription_resumed':
                await handleSubscriptionResumed(event, supabase);
                break;

            case 'subscription_expired':
                await handleSubscriptionExpired(event, supabase);
                break;

            case 'subscription_paused':
                await handleSubscriptionPaused(event, supabase);
                break;

            case 'subscription_unpaused':
                await handleSubscriptionUnpaused(event, supabase);
                break;

            case 'order_created':
                await handleOrderCreated(event, supabase);
                break;

            case 'order_refunded':
                await handleOrderRefunded(event, supabase);
                break;

            case 'subscription_payment_failed':
                await handlePaymentFailed(event, supabase);
                break;

            case 'subscription_payment_success':
                await handlePaymentSuccess(event, supabase);
                break;

            case 'subscription_payment_recovered':
                await handlePaymentRecovered(event, supabase);
                break;

            default:
                console.log(`Unhandled webhook event: ${event.meta.event_name}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Webhook event handlers
async function handleSubscriptionCreated(event: WebhookEvent, supabase: any) {
    const subscription = event.data.attributes;
    const customData = event.meta.custom_data;

    if (!customData?.user_id) {
        console.error('No user_id in subscription webhook');
        return;
    }

    // Update user subscription in database
    const { error } = await supabase
        .from('users')
        .update({
            subscription_tier: 'pro',
            lemonsqueezy_customer_id: subscription.customer_id,
            lemonsqueezy_subscription_id: event.data.id,
            subscription_status: subscription.status,
            subscription_current_period_start: subscription.renews_at,
            subscription_current_period_end: subscription.ends_at,
            updated_at: new Date().toISOString(),
        })
        .eq('id', customData.user_id);

    if (error) {
        console.error('Failed to update user subscription:', error);
        throw error;
    }

    // Log the subscription creation
    await supabase.from('subscription_events').insert({
        user_id: customData.user_id,
        event_type: 'subscription_created',
        lemonsqueezy_subscription_id: event.data.id,
        event_data: subscription,
        created_at: new Date().toISOString(),
    });

    console.log(`Subscription created for user ${customData.user_id}`);
}

async function handleSubscriptionUpdated(event: WebhookEvent, supabase: any) {
    const subscription = event.data.attributes;
    const subscriptionId = event.data.id;

    // Find user by subscription ID
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('lemonsqueezy_subscription_id', subscriptionId)
        .single();

    if (userError || !user) {
        console.error('User not found for subscription:', subscriptionId);
        return;
    }

    // Update subscription details
    const { error } = await supabase
        .from('users')
        .update({
            subscription_status: subscription.status,
            subscription_current_period_start: subscription.renews_at,
            subscription_current_period_end: subscription.ends_at,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        console.error('Failed to update subscription:', error);
        throw error;
    }

    // Log the event
    await supabase.from('subscription_events').insert({
        user_id: user.id,
        event_type: 'subscription_updated',
        lemonsqueezy_subscription_id: subscriptionId,
        event_data: subscription,
        created_at: new Date().toISOString(),
    });
}

async function handleSubscriptionCancelled(event: WebhookEvent, supabase: any) {
    const subscription = event.data.attributes;
    const subscriptionId = event.data.id;

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('lemonsqueezy_subscription_id', subscriptionId)
        .single();

    if (userError || !user) {
        console.error('User not found for subscription:', subscriptionId);
        return;
    }

    // Update subscription status
    const { error } = await supabase
        .from('users')
        .update({
            subscription_status: 'cancelled',
            subscription_cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        console.error('Failed to cancel subscription:', error);
        throw error;
    }

    // Log the cancellation
    await supabase.from('subscription_events').insert({
        user_id: user.id,
        event_type: 'subscription_cancelled',
        lemonsqueezy_subscription_id: subscriptionId,
        event_data: subscription,
        created_at: new Date().toISOString(),
    });

    console.log(`Subscription cancelled for user ${user.id}`);
}

async function handleSubscriptionResumed(event: WebhookEvent, supabase: any) {
    const subscription = event.data.attributes;
    const subscriptionId = event.data.id;

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('lemonsqueezy_subscription_id', subscriptionId)
        .single();

    if (userError || !user) {
        console.error('User not found for subscription:', subscriptionId);
        return;
    }

    const { error } = await supabase
        .from('users')
        .update({
            subscription_status: 'active',
            subscription_cancelled_at: null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        console.error('Failed to resume subscription:', error);
        throw error;
    }

    await supabase.from('subscription_events').insert({
        user_id: user.id,
        event_type: 'subscription_resumed',
        lemonsqueezy_subscription_id: subscriptionId,
        event_data: subscription,
        created_at: new Date().toISOString(),
    });
}

async function handleSubscriptionExpired(event: WebhookEvent, supabase: any) {
    const subscription = event.data.attributes;
    const subscriptionId = event.data.id;

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('lemonsqueezy_subscription_id', subscriptionId)
        .single();

    if (userError || !user) {
        console.error('User not found for subscription:', subscriptionId);
        return;
    }

    // Downgrade to free tier
    const { error } = await supabase
        .from('users')
        .update({
            subscription_tier: 'free',
            subscription_status: 'expired',
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        console.error('Failed to expire subscription:', error);
        throw error;
    }

    await supabase.from('subscription_events').insert({
        user_id: user.id,
        event_type: 'subscription_expired',
        lemonsqueezy_subscription_id: subscriptionId,
        event_data: subscription,
        created_at: new Date().toISOString(),
    });

    console.log(`Subscription expired for user ${user.id}, downgraded to free`);
}

async function handleSubscriptionPaused(event: WebhookEvent, supabase: any) {
    const subscription = event.data.attributes;
    const subscriptionId = event.data.id;

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('lemonsqueezy_subscription_id', subscriptionId)
        .single();

    if (userError || !user) {
        console.error('User not found for subscription:', subscriptionId);
        return;
    }

    const { error } = await supabase
        .from('users')
        .update({
            subscription_status: 'paused',
            subscription_paused_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        console.error('Failed to pause subscription:', error);
        throw error;
    }

    await supabase.from('subscription_events').insert({
        user_id: user.id,
        event_type: 'subscription_paused',
        lemonsqueezy_subscription_id: subscriptionId,
        event_data: subscription,
        created_at: new Date().toISOString(),
    });
}

async function handleSubscriptionUnpaused(event: WebhookEvent, supabase: any) {
    const subscription = event.data.attributes;
    const subscriptionId = event.data.id;

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('lemonsqueezy_subscription_id', subscriptionId)
        .single();

    if (userError || !user) {
        console.error('User not found for subscription:', subscriptionId);
        return;
    }

    const { error } = await supabase
        .from('users')
        .update({
            subscription_status: 'active',
            subscription_paused_at: null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        console.error('Failed to unpause subscription:', error);
        throw error;
    }

    await supabase.from('subscription_events').insert({
        user_id: user.id,
        event_type: 'subscription_unpaused',
        lemonsqueezy_subscription_id: subscriptionId,
        event_data: subscription,
        created_at: new Date().toISOString(),
    });
}

async function handleOrderCreated(event: WebhookEvent, supabase: any) {
    const order = event.data.attributes;
    const customData = event.meta.custom_data;

    // Handle one-time purchases (like featured listings)
    if (customData?.product_type === 'featured-listing') {
        await handleFeaturedListingPurchase(order, customData, supabase);
    } else if (customData?.product_type === 'marketplace-product') {
        await handleMarketplacePurchase(order, customData, supabase);
    }

    // Log the order
    await supabase.from('orders').insert({
        lemonsqueezy_order_id: event.data.id,
        user_id: customData?.user_id,
        amount: order.total,
        currency: order.currency,
        status: order.status,
        product_type: customData?.product_type,
        metadata: customData,
        created_at: new Date().toISOString(),
    });
}

async function handleOrderRefunded(event: WebhookEvent, supabase: any) {
    const order = event.data.attributes;
    const orderId = event.data.id;

    // Update order status
    const { error } = await supabase
        .from('orders')
        .update({
            status: 'refunded',
            refunded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('lemonsqueezy_order_id', orderId);

    if (error) {
        console.error('Failed to update refunded order:', error);
    }

    // Handle refund logic based on product type
    const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('lemonsqueezy_order_id', orderId)
        .single();

    if (orderData?.product_type === 'featured-listing') {
        // Remove featured status
        await handleFeaturedListingRefund(orderData, supabase);
    } else if (orderData?.product_type === 'marketplace-product') {
        // Handle marketplace refund
        await handleMarketplaceRefund(orderData, supabase);
    }
}

async function handlePaymentFailed(event: WebhookEvent, supabase: any) {
    const subscription = event.data.attributes;
    const subscriptionId = event.data.id;

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('lemonsqueezy_subscription_id', subscriptionId)
        .single();

    if (userError || !user) {
        console.error('User not found for subscription:', subscriptionId);
        return;
    }

    const { error } = await supabase
        .from('users')
        .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        console.error('Failed to update payment failed status:', error);
    }

    await supabase.from('subscription_events').insert({
        user_id: user.id,
        event_type: 'payment_failed',
        lemonsqueezy_subscription_id: subscriptionId,
        event_data: subscription,
        created_at: new Date().toISOString(),
    });

    // TODO: Send payment failed notification email
}

async function handlePaymentSuccess(event: WebhookEvent, supabase: any) {
    const subscription = event.data.attributes;
    const subscriptionId = event.data.id;

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('lemonsqueezy_subscription_id', subscriptionId)
        .single();

    if (userError || !user) {
        console.error('User not found for subscription:', subscriptionId);
        return;
    }

    const { error } = await supabase
        .from('users')
        .update({
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        console.error('Failed to update payment success status:', error);
    }

    await supabase.from('subscription_events').insert({
        user_id: user.id,
        event_type: 'payment_success',
        lemonsqueezy_subscription_id: subscriptionId,
        event_data: subscription,
        created_at: new Date().toISOString(),
    });
}

async function handlePaymentRecovered(event: WebhookEvent, supabase: any) {
    const subscription = event.data.attributes;
    const subscriptionId = event.data.id;

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('lemonsqueezy_subscription_id', subscriptionId)
        .single();

    if (userError || !user) {
        console.error('User not found for subscription:', subscriptionId);
        return;
    }

    const { error } = await supabase
        .from('users')
        .update({
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        console.error('Failed to update payment recovered status:', error);
    }

    await supabase.from('subscription_events').insert({
        user_id: user.id,
        event_type: 'payment_recovered',
        lemonsqueezy_subscription_id: subscriptionId,
        event_data: subscription,
        created_at: new Date().toISOString(),
    });
}

// Helper functions for specific product types
async function handleFeaturedListingPurchase(order: any, customData: any, supabase: any) {
    const { product_id, duration } = customData;

    if (!product_id || !duration) {
        console.error('Missing product_id or duration for featured listing');
        return;
    }

    const durationDays = duration === 'daily' ? 1 : duration === 'weekly' ? 7 : 30;
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + durationDays);

    await supabase
        .from('marketplace_listings')
        .update({
            is_featured: true,
            featured_until: featuredUntil.toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('product_id', product_id);
}

async function handleMarketplacePurchase(order: any, customData: any, supabase: any) {
    const { product_id, seller_id, affiliate_id } = customData;

    if (!product_id || !seller_id) {
        console.error('Missing product_id or seller_id for marketplace purchase');
        return;
    }

    // Calculate commissions
    const total = order.total;
    const platformFee = total * 0.30; // 30%
    const affiliateCommission = affiliate_id ? total * 0.10 : 0; // 10% if affiliate
    const sellerEarnings = total - platformFee - affiliateCommission;

    // Create transaction record
    await supabase.from('sales_transactions').insert({
        buyer_id: customData.user_id,
        seller_id,
        product_id,
        affiliate_id,
        amount: total,
        platform_fee: platformFee,
        seller_earnings: sellerEarnings,
        affiliate_commission: affiliateCommission,
        payment_status: 'completed',
        lemonsqueezy_order_id: order.id,
        created_at: new Date().toISOString(),
    });

    // Update sales count
    await supabase
        .from('marketplace_listings')
        .update({
            sales_count: supabase.raw('sales_count + 1'),
            updated_at: new Date().toISOString(),
        })
        .eq('product_id', product_id);
}

async function handleFeaturedListingRefund(orderData: any, supabase: any) {
    const { metadata } = orderData;
    if (metadata?.product_id) {
        await supabase
            .from('marketplace_listings')
            .update({
                is_featured: false,
                featured_until: null,
                updated_at: new Date().toISOString(),
            })
            .eq('product_id', metadata.product_id);
    }
}

async function handleMarketplaceRefund(orderData: any, supabase: any) {
    const { metadata } = orderData;
    if (metadata?.product_id) {
        // Update transaction status
        await supabase
            .from('sales_transactions')
            .update({
                payment_status: 'refunded',
                updated_at: new Date().toISOString(),
            })
            .eq('lemonsqueezy_order_id', orderData.lemonsqueezy_order_id);

        // Decrease sales count
        await supabase
            .from('marketplace_listings')
            .update({
                sales_count: supabase.raw('GREATEST(sales_count - 1, 0)'),
                updated_at: new Date().toISOString(),
            })
            .eq('product_id', metadata.product_id);
    }
}