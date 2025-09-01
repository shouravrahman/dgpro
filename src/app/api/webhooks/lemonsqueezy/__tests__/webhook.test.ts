import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';
import crypto from 'crypto';

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            update: vi.fn(() => ({
                eq: vi.fn(),
            })),
            insert: vi.fn(),
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(),
                })),
            })),
        })),
    })),
}));

vi.mock('@/lib/lemonsqueezy/config', () => ({
    LEMONSQUEEZY_CONFIG: {
        webhookSecret: 'test-webhook-secret',
    },
}));

describe('/api/webhooks/lemonsqueezy', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createSignedRequest = (payload: any) => {
        const payloadString = JSON.stringify(payload);
        const hmac = crypto.createHmac('sha256', 'test-webhook-secret');
        hmac.update(payloadString);
        const signature = hmac.digest('hex');

        return new NextRequest('http://localhost/api/webhooks/lemonsqueezy', {
            method: 'POST',
            body: payloadString,
            headers: {
                'Content-Type': 'application/json',
                'x-signature': signature,
            },
        });
    };

    it('should handle subscription_created webhook', async () => {
        const webhookPayload = {
            meta: {
                event_name: 'subscription_created',
                custom_data: {
                    user_id: 'user-123',
                },
            },
            data: {
                id: 'sub-123',
                type: 'subscriptions',
                attributes: {
                    customer_id: 'cust-123',
                    status: 'active',
                    renews_at: '2024-01-01T00:00:00Z',
                    ends_at: '2024-02-01T00:00:00Z',
                },
            },
        };

        const { createClient } = await import('@/lib/supabase/server');
        const mockSupabase = createClient();

        // @ts-ignore
        mockSupabase.from().update().eq.mockResolvedValue({ error: null });
        // @ts-ignore
        mockSupabase.from().insert.mockResolvedValue({ error: null });

        const request = createSignedRequest(webhookPayload);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.received).toBe(true);
    });

    it('should handle subscription_cancelled webhook', async () => {
        const webhookPayload = {
            meta: {
                event_name: 'subscription_cancelled',
                custom_data: {},
            },
            data: {
                id: 'sub-123',
                type: 'subscriptions',
                attributes: {
                    status: 'cancelled',
                },
            },
        };

        const { createClient } = await import('@/lib/supabase/server');
        const mockSupabase = createClient();

        // @ts-ignore
        mockSupabase.from().select().eq().single.mockResolvedValue({
            data: { id: 'user-123' },
            error: null,
        });
        // @ts-ignore
        mockSupabase.from().update().eq.mockResolvedValue({ error: null });
        // @ts-ignore
        mockSupabase.from().insert.mockResolvedValue({ error: null });

        const request = createSignedRequest(webhookPayload);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.received).toBe(true);
    });

    it('should handle order_created webhook for marketplace purchase', async () => {
        const webhookPayload = {
            meta: {
                event_name: 'order_created',
                custom_data: {
                    user_id: 'user-123',
                    product_type: 'marketplace-product',
                    product_id: 'prod-123',
                    seller_id: 'seller-123',
                },
            },
            data: {
                id: 'order-123',
                type: 'orders',
                attributes: {
                    total: 100,
                    currency: 'USD',
                    status: 'paid',
                },
            },
        };

        const { createClient } = await import('@/lib/supabase/server');
        const mockSupabase = createClient();

        // @ts-ignore
        mockSupabase.from().insert.mockResolvedValue({ error: null });
        // @ts-ignore
        mockSupabase.from().update().eq.mockResolvedValue({ error: null });
        // @ts-ignore
        mockSupabase.raw = vi.fn((sql) => sql);

        const request = createSignedRequest(webhookPayload);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.received).toBe(true);
    });

    it('should reject webhook with invalid signature', async () => {
        const webhookPayload = {
            meta: {
                event_name: 'subscription_created',
                custom_data: {
                    user_id: 'user-123',
                },
            },
            data: {
                id: 'sub-123',
                type: 'subscriptions',
                attributes: {},
            },
        };

        const request = new NextRequest('http://localhost/api/webhooks/lemonsqueezy', {
            method: 'POST',
            body: JSON.stringify(webhookPayload),
            headers: {
                'Content-Type': 'application/json',
                'x-signature': 'invalid-signature',
            },
        });

        const response = await POST(request);

        expect(response.status).toBe(401);
    });

    it('should reject webhook without signature', async () => {
        const webhookPayload = {
            meta: {
                event_name: 'subscription_created',
                custom_data: {
                    user_id: 'user-123',
                },
            },
            data: {
                id: 'sub-123',
                type: 'subscriptions',
                attributes: {},
            },
        };

        const request = new NextRequest('http://localhost/api/webhooks/lemonsqueezy', {
            method: 'POST',
            body: JSON.stringify(webhookPayload),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const response = await POST(request);

        expect(response.status).toBe(400);
    });

    it('should handle unknown webhook events gracefully', async () => {
        const webhookPayload = {
            meta: {
                event_name: 'unknown_event',
                custom_data: {},
            },
            data: {
                id: 'test-123',
                type: 'unknown',
                attributes: {},
            },
        };

        const request = createSignedRequest(webhookPayload);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.received).toBe(true);
    });
});