import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LemonSqueezyClient } from '../client';

// Mock the LemonSqueezy SDK
vi.mock('@lemonsqueezy/lemonsqueezy.js', () => ({
    lemonSqueezySetup: vi.fn(),
    createCheckout: vi.fn(),
    getSubscription: vi.fn(),
    updateSubscription: vi.fn(),
    cancelSubscription: vi.fn(),
    getCustomer: vi.fn(),
    createCustomer: vi.fn(),
    updateCustomer: vi.fn(),
    getOrder: vi.fn(),
    listOrders: vi.fn(),
    getVariant: vi.fn(),
    listProducts: vi.fn(),
}));

vi.mock('../config', () => ({
    LEMONSQUEEZY_CONFIG: {
        storeId: 'test-store-123',
        apiKey: 'test-api-key',
        webhookSecret: 'test-webhook-secret',
        checkoutUrl: 'https://test.lemonsqueezy.com',
    },
    LEMONSQUEEZY_PRODUCTS: {
        subscriptions: {
            pro: {
                monthly: 'variant-pro-monthly',
                yearly: 'variant-pro-yearly',
            },
        },
        oneTime: {
            featuredListing: {
                daily: 'variant-featured-daily',
                weekly: 'variant-featured-weekly',
                monthly: 'variant-featured-monthly',
            },
        },
    },
}));

describe('LemonSqueezyClient', () => {
    let client: LemonSqueezyClient;

    beforeEach(() => {
        vi.clearAllMocks();
        client = new LemonSqueezyClient();
    });

    describe('createCheckoutSession', () => {
        it('should create a checkout session successfully', async () => {
            const { createCheckout } = await import('@lemonsqueezy/lemonsqueezy.js');

            // @ts-ignore
            createCheckout.mockResolvedValue({
                data: {
                    id: 'checkout-123',
                    attributes: {
                        url: 'https://checkout.lemonsqueezy.com/123',
                    },
                },
            });

            const checkoutData = {
                variantId: 'variant-123',
                userId: 'user-123',
                customerEmail: 'test@example.com',
                customerName: 'Test User',
                productType: 'subscription' as const,
                productName: 'Pro Plan',
                successUrl: 'https://example.com/success',
            };

            const result = await client.createCheckoutSession(checkoutData);

            expect(result.success).toBe(true);
            expect(result.data?.checkoutUrl).toBe('https://checkout.lemonsqueezy.com/123');
            expect(result.data?.checkoutId).toBe('checkout-123');
        });

        it('should handle checkout creation errors', async () => {
            const { createCheckout } = await import('@lemonsqueezy/lemonsqueezy.js');

            // @ts-ignore
            createCheckout.mockRejectedValue(new Error('Checkout failed'));

            const checkoutData = {
                variantId: 'variant-123',
                userId: 'user-123',
                customerEmail: 'test@example.com',
                customerName: 'Test User',
                productType: 'subscription' as const,
                productName: 'Pro Plan',
                successUrl: 'https://example.com/success',
            };

            const result = await client.createCheckoutSession(checkoutData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Checkout failed');
        });
    });

    describe('getSubscriptionDetails', () => {
        it('should get subscription details successfully', async () => {
            const { getSubscription } = await import('@lemonsqueezy/lemonsqueezy.js');

            // @ts-ignore
            getSubscription.mockResolvedValue({
                data: {
                    id: 'sub-123',
                    attributes: {
                        status: 'active',
                    },
                },
            });

            const result = await client.getSubscriptionDetails('sub-123');

            expect(result.success).toBe(true);
            expect(result.data?.id).toBe('sub-123');
        });

        it('should handle subscription fetch errors', async () => {
            const { getSubscription } = await import('@lemonsqueezy/lemonsqueezy.js');

            // @ts-ignore
            getSubscription.mockRejectedValue(new Error('Subscription not found'));

            const result = await client.getSubscriptionDetails('invalid-sub');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Subscription not found');
        });
    });

    describe('updateSubscriptionPlan', () => {
        it('should update subscription plan successfully', async () => {
            const { updateSubscription } = await import('@lemonsqueezy/lemonsqueezy.js');

            // @ts-ignore
            updateSubscription.mockResolvedValue({
                data: {
                    id: 'sub-123',
                    attributes: {
                        status: 'active',
                        variant_id: 456,
                    },
                },
            });

            const result = await client.updateSubscriptionPlan('sub-123', '456');

            expect(result.success).toBe(true);
            expect(result.data?.attributes.variant_id).toBe(456);
        });
    });

    describe('cancelSubscriptionPlan', () => {
        it('should cancel subscription successfully', async () => {
            const { cancelSubscription } = await import('@lemonsqueezy/lemonsqueezy.js');

            // @ts-ignore
            cancelSubscription.mockResolvedValue({
                data: {
                    id: 'sub-123',
                    attributes: {
                        status: 'cancelled',
                    },
                },
            });

            const result = await client.cancelSubscriptionPlan('sub-123', true);

            expect(result.success).toBe(true);
            expect(result.data?.attributes.status).toBe('cancelled');
        });
    });

    describe('getSubscriptionVariantId', () => {
        it('should return correct variant ID for pro monthly', () => {
            const variantId = client.getSubscriptionVariantId('pro', 'monthly');
            expect(variantId).toBe('variant-pro-monthly');
        });

        it('should return correct variant ID for pro yearly', () => {
            const variantId = client.getSubscriptionVariantId('pro', 'yearly');
            expect(variantId).toBe('variant-pro-yearly');
        });
    });

    describe('getFeaturedListingVariantId', () => {
        it('should return correct variant ID for daily featured listing', () => {
            const variantId = client.getFeaturedListingVariantId('daily');
            expect(variantId).toBe('variant-featured-daily');
        });

        it('should return correct variant ID for weekly featured listing', () => {
            const variantId = client.getFeaturedListingVariantId('weekly');
            expect(variantId).toBe('variant-featured-weekly');
        });

        it('should return correct variant ID for monthly featured listing', () => {
            const variantId = client.getFeaturedListingVariantId('monthly');
            expect(variantId).toBe('variant-featured-monthly');
        });
    });
});