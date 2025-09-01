import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase client
const mockSupabase = {
    auth: {
        getUser: () => Promise.resolve({ data: { user: null } }),
    },
    from: (table: string) => ({
        select: () => ({
            eq: () => ({
                single: () => Promise.resolve({ data: null, error: null }),
            }),
        }),
        insert: () => ({
            select: () => ({
                single: () => Promise.resolve({
                    data: {
                        id: 'test-cart-id',
                        total_amount: 0,
                        currency: 'USD'
                    },
                    error: null
                }),
            }),
        }),
    }),
};

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
    createClient: () => mockSupabase,
}));

describe('Cart API', () => {
    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Clean up after each test
        vi.restoreAllMocks();
    });

    describe('GET /api/cart', () => {
        it('should create a new cart for guest users', async () => {
            const request = new Request('http://localhost:3000/api/cart', {
                headers: {
                    'x-session-id': 'test-session-id',
                },
            });

            // Mock the cart route handler
            const { GET } = await import('../route');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.cart).toBeDefined();
        });

        it('should return error when session ID is missing for guest users', async () => {
            const request = new Request('http://localhost:3000/api/cart');

            const { GET } = await import('../route');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('MISSING_SESSION_ID');
        });
    });

    describe('POST /api/cart', () => {
        it('should validate required fields', async () => {
            const request = new Request('http://localhost:3000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-session-id': 'test-session-id',
                },
                body: JSON.stringify({}),
            });

            const { POST } = await import('../route');
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('VALIDATION_ERROR');
        });

        it('should add product to cart with valid data', async () => {
            // Mock product exists
            mockSupabase.from = (table: string) => {
                if (table === 'products') {
                    return {
                        select: () => ({
                            eq: () => ({
                                single: () => Promise.resolve({
                                    data: { price: 29.99 },
                                    error: null
                                }),
                            }),
                        }),
                    };
                }
                // Default cart behavior
                return {
                    select: () => ({
                        eq: () => ({
                            single: () => Promise.resolve({ data: null, error: null }),
                        }),
                    }),
                    insert: () => ({
                        select: () => ({
                            single: () => Promise.resolve({
                                data: {
                                    id: 'test-cart-id',
                                    total_amount: 0,
                                    currency: 'USD'
                                },
                                error: null
                            }),
                        }),
                    }),
                };
            };

            const request = new Request('http://localhost:3000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-session-id': 'test-session-id',
                },
                body: JSON.stringify({
                    product_id: 'test-product-id',
                    quantity: 1,
                }),
            });

            const { POST } = await import('../route');
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.cart_item).toBeDefined();
        });
    });
});

describe('Cart Validation', () => {
    it('should validate add to cart schema', async () => {
        const { addToCartSchema } = await import('@/lib/validations/cart');

        // Valid data
        const validData = {
            product_id: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 2,
        };

        const result = addToCartSchema.safeParse(validData);
        expect(result.success).toBe(true);

        // Invalid data - no product_id or bundle_id
        const invalidData = {
            quantity: 1,
        };

        const invalidResult = addToCartSchema.safeParse(invalidData);
        expect(invalidResult.success).toBe(false);
    });

    it('should validate coupon schema', async () => {
        const { applyCouponSchema } = await import('@/lib/validations/cart');

        // Valid coupon code
        const validData = {
            coupon_code: 'SAVE10',
        };

        const result = applyCouponSchema.safeParse(validData);
        expect(result.success).toBe(true);
        expect(result.data?.coupon_code).toBe('SAVE10');

        // Invalid - empty code
        const invalidData = {
            coupon_code: '',
        };

        const invalidResult = applyCouponSchema.safeParse(invalidData);
        expect(invalidResult.success).toBe(false);
    });
});

describe('Cart Utilities', () => {
    it('should format currency correctly', async () => {
        const { formatCurrency } = await import('@/lib/utils');

        expect(formatCurrency(29.99)).toBe('$29.99');
        expect(formatCurrency(0)).toBe('$0.00');
        expect(formatCurrency(1000)).toBe('$1,000.00');
    });
});