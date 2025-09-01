import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { lemonSqueezyClient } from '@/lib/lemonsqueezy/client';

// GET /api/billing - Get user's billing information and usage
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

        // Get user's subscription and usage data
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select(`
        subscription_tier,
        subscription_status,
        lemonsqueezy_customer_id,
        lemonsqueezy_subscription_id,
        subscription_current_period_start,
        subscription_current_period_end,
        subscription_cancelled_at,
        usage_ai_requests,
        usage_products,
        usage_marketplace_listings,
        usage_file_uploads,
        usage_storage_bytes
      `)
            .eq('id', user.id)
            .single();

        if (userError) {
            console.error('Failed to get user billing data:', userError);
            return NextResponse.json(
                { error: 'Failed to get billing information' },
                { status: 500 }
            );
        }

        // Get subscription tier limits
        const tierLimits = getTierLimits(userData.subscription_tier);

        // Get recent orders if customer exists
        let orders = [];
        if (userData.lemonsqueezy_customer_id) {
            const ordersResult = await lemonSqueezyClient.getCustomerOrders(
                userData.lemonsqueezy_customer_id
            );
            if (ordersResult.success) {
                orders = ordersResult.data;
            }
        }

        // Calculate usage percentages
        const usage = {
            aiRequests: {
                used: userData.usage_ai_requests || 0,
                limit: tierLimits.aiRequests,
                percentage: tierLimits.aiRequests === -1 ? 0 :
                    Math.round(((userData.usage_ai_requests || 0) / tierLimits.aiRequests) * 100),
            },
            products: {
                used: userData.usage_products || 0,
                limit: tierLimits.products,
                percentage: tierLimits.products === -1 ? 0 :
                    Math.round(((userData.usage_products || 0) / tierLimits.products) * 100),
            },
            marketplaceListings: {
                used: userData.usage_marketplace_listings || 0,
                limit: tierLimits.marketplaceListings,
                percentage: tierLimits.marketplaceListings === -1 ? 0 :
                    Math.round(((userData.usage_marketplace_listings || 0) / tierLimits.marketplaceListings) * 100),
            },
            fileUploads: {
                used: userData.usage_file_uploads || 0,
                limit: tierLimits.fileUploads,
                percentage: tierLimits.fileUploads === -1 ? 0 :
                    Math.round(((userData.usage_file_uploads || 0) / tierLimits.fileUploads) * 100),
            },
            storage: {
                used: userData.usage_storage_bytes || 0,
                limit: tierLimits.storageBytes,
                percentage: tierLimits.storageBytes === -1 ? 0 :
                    Math.round(((userData.usage_storage_bytes || 0) / tierLimits.storageBytes) * 100),
            },
        };

        return NextResponse.json({
            success: true,
            data: {
                subscription: {
                    tier: userData.subscription_tier,
                    status: userData.subscription_status,
                    currentPeriodStart: userData.subscription_current_period_start,
                    currentPeriodEnd: userData.subscription_current_period_end,
                    cancelledAt: userData.subscription_cancelled_at,
                },
                usage,
                tierLimits,
                orders: orders.slice(0, 10), // Last 10 orders
            },
        });
    } catch (error) {
        console.error('Billing GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Helper function to get tier limits
function getTierLimits(tier: string) {
    const limits = {
        free: {
            aiRequests: 10,
            products: 3,
            marketplaceListings: 1,
            fileUploads: 5,
            storageBytes: 100 * 1024 * 1024, // 100MB
            storage: '100MB',
        },
        pro: {
            aiRequests: -1, // Unlimited
            products: -1, // Unlimited
            marketplaceListings: -1, // Unlimited
            fileUploads: -1, // Unlimited
            storageBytes: 10 * 1024 * 1024 * 1024, // 10GB
            storage: '10GB',
        },
    };

    return limits[tier as keyof typeof limits] || limits.free;
}