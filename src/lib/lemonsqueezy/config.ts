import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

// LemonSqueezy configuration
export const LEMONSQUEEZY_CONFIG = {
    apiKey: process.env.LEMONSQUEEZY_API_KEY!,
    storeId: process.env.LEMONSQUEEZY_STORE_ID!,
    webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET!,
    checkoutUrl: process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL!,
};

// Initialize LemonSqueezy
lemonSqueezySetup({
    apiKey: LEMONSQUEEZY_CONFIG.apiKey,
});

// Validate configuration
export function validateLemonSqueezyConfig() {
    const requiredVars = [
        'LEMONSQUEEZY_API_KEY',
        'LEMONSQUEEZY_STORE_ID',
        'LEMONSQUEEZY_WEBHOOK_SECRET',
        'NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL',
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required LemonSqueezy environment variables: ${missing.join(', ')}`
        );
    }
}

// Product and variant IDs (these would be configured in your LemonSqueezy dashboard)
export const LEMONSQUEEZY_PRODUCTS = {
    subscriptions: {
        pro: {
            monthly: process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID!,
            yearly: process.env.LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID!,
        },
    },
    oneTime: {
        featuredListing: {
            daily: process.env.LEMONSQUEEZY_FEATURED_DAILY_VARIANT_ID!,
            weekly: process.env.LEMONSQUEEZY_FEATURED_WEEKLY_VARIANT_ID!,
            monthly: process.env.LEMONSQUEEZY_FEATURED_MONTHLY_VARIANT_ID!,
        },
    },
};