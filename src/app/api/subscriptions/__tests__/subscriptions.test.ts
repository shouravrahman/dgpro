import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '../route';

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn(),
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(),
                })),
            })),
            update: vi.fn(() => ({
                eq: vi.fn(),
            })),
        })),
    })),
}));

vi.mock('@/lib/lemonsqueezy/client', () => ({
    lemonSqueezyClient: {
        getSubscriptionDetails: vi.fn(),
        createCheckoutSession: vi.fn(),
        updateSubscriptionPlan: vi.fn(),
        cancelSubscriptionPlan: vi.fn(),
        getSubscriptionVariantId: vi.fn(),
    },
}));

vi.mock('@/lib/lemonsqueezy/config', () => ({
    validateLemonSqueezyConfig: vi.fn(),
}));

describe('/api/subscriptions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET', () => {
        it('should return subscription details for authenticated user', async () => {
            const mockUser = { id: 'user-123' };
            const mockUserData = {
                subscription_tier: 'pro',
                subscription_status: 'active',
                lemonsqueezy_subscription_id: 'sub-123',
            };

            const { createClient } = await import('@/lib/supabase/server');
            const mockSupabase = createClient();

            // @ts-ignore
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            });

            // @ts-ignore
            mockSupabase.from().select().eq().single.mockResolvedValue({
                data: mockUserData,
                error: null,
            });

            const { lemonSqueezyClient } = await import('@/lib/lemonsqueezy/client');
            // @ts-ignore
            lemonSqueezyClient.getSubscriptionDetails.mockResolvedValue({
                success: true,
                data: { status: 'active' },
            });

            const request = new NextRequest('http://localhost/api/subscriptions');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toMatchObject(mockUserData);
        });

        it('should return 401 for unauthenticated user', async () => {
            const { createClient } = await import('@/lib/supabase/server');
            const mockSupabase = createClient();

            // @ts-ignore
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: new Error('Unauthorized'),
            });

            const request = new NextRequest('http://localhost/api/subscriptions');
            const response = await GET(request);

            expect(response.status).toBe(401);
        });
    });

    describe('POST', () => {
        it('should create checkout session for valid subscription request', async () => {
            const mockUser = { id: 'user-123' };
            const mockUserData = {
                email: 'test@example.com',
                full_name: 'Test User',
            };

            const { createClient } = await import('@/lib/supabase/server');
            const mockSupabase = createClient();

            // @ts-ignore
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            });

            // @ts-ignore
            mockSupabase.from().select().eq().single.mockResolvedValue({
                data: mockUserData,
                error: null,
            });

            const { lemonSqueezyClient } = await import('@/lib/lemonsqueezy/client');
            // @ts-ignore
            lemonSqueezyClient.getSubscriptionVariantId.mockReturnValue('variant-123');
            // @ts-ignore
            lemonSqueezyClient.createCheckoutSession.mockResolvedValue({
                success: true,
                data: {
                    checkoutUrl: 'https://checkout.lemonsqueezy.com/123',
                    checkoutId: 'checkout-123',
                },
            });

            const requestBody = {
                tier: 'pro',
                interval: 'monthly',
                successUrl: 'http://localhost/success',
            };

            const request = new NextRequest('http://localhost/api/subscriptions', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.checkoutUrl).toBeDefined();
        });

        it('should return 400 for invalid request data', async () => {
            const mockUser = { id: 'user-123' };

            const { createClient } = await import('@/lib/supabase/server');
            const mockSupabase = createClient();

            // @ts-ignore
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            });

            const requestBody = {
                tier: 'invalid-tier',
                interval: 'monthly',
                successUrl: 'invalid-url',
            };

            const request = new NextRequest('http://localhost/api/subscriptions', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response = await POST(request);

            expect(response.status).toBe(400);
        });
    });

    describe('PUT', () => {
        it('should update existing subscription', async () => {
            const mockUser = { id: 'user-123' };
            const mockUserData = {
                lemonsqueezy_subscription_id: 'sub-123',
                subscription_tier: 'pro',
            };

            const { createClient } = await import('@/lib/supabase/server');
            const mockSupabase = createClient();

            // @ts-ignore
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            });

            // @ts-ignore
            mockSupabase.from().select().eq().single.mockResolvedValue({
                data: mockUserData,
                error: null,
            });

            const { lemonSqueezyClient } = await import('@/lib/lemonsqueezy/client');
            // @ts-ignore
            lemonSqueezyClient.getSubscriptionVariantId.mockReturnValue('variant-456');
            // @ts-ignore
            lemonSqueezyClient.updateSubscriptionPlan.mockResolvedValue({
                success: true,
                data: { status: 'active' },
            });

            const requestBody = {
                tier: 'pro',
                interval: 'yearly',
            };

            const request = new NextRequest('http://localhost/api/subscriptions', {
                method: 'PUT',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });

        it('should return 404 for user without subscription', async () => {
            const mockUser = { id: 'user-123' };
            const mockUserData = {
                lemonsqueezy_subscription_id: null,
                subscription_tier: 'free',
            };

            const { createClient } = await import('@/lib/supabase/server');
            const mockSupabase = createClient();

            // @ts-ignore
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            });

            // @ts-ignore
            mockSupabase.from().select().eq().single.mockResolvedValue({
                data: mockUserData,
                error: null,
            });

            const requestBody = {
                tier: 'pro',
                interval: 'yearly',
            };

            const request = new NextRequest('http://localhost/api/subscriptions', {
                method: 'PUT',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response = await PUT(request);

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE', () => {
        it('should cancel existing subscription', async () => {
            const mockUser = { id: 'user-123' };
            const mockUserData = {
                lemonsqueezy_subscription_id: 'sub-123',
            };

            const { createClient } = await import('@/lib/supabase/server');
            const mockSupabase = createClient();

            // @ts-ignore
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            });

            // @ts-ignore
            mockSupabase.from().select().eq().single.mockResolvedValue({
                data: mockUserData,
                error: null,
            });

            const { lemonSqueezyClient } = await import('@/lib/lemonsqueezy/client');
            // @ts-ignore
            lemonSqueezyClient.cancelSubscriptionPlan.mockResolvedValue({
                success: true,
                data: { status: 'cancelled' },
            });

            const request = new NextRequest('http://localhost/api/subscriptions?cancelAtPeriodEnd=true', {
                method: 'DELETE',
            });

            const response = await DELETE(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });
    });
});