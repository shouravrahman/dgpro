import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock Supabase
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
            insert: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn(),
                })),
            })),
        })),
        rpc: vi.fn(),
    })),
}));

// Mock AffiliateService
vi.mock('@/lib/services/affiliate', () => ({
    AffiliateService: vi.fn(() => ({
        getAffiliates: vi.fn(),
        createAffiliate: vi.fn(),
        getAffiliate: vi.fn(),
    })),
}));

describe('/api/affiliates', () => {
    let mockRequest: NextRequest;

    beforeEach(() => {
        vi.clearAllMocks();
        mockRequest = new NextRequest('http://localhost:3000/api/affiliates');
    });

    describe('GET /api/affiliates', () => {
        it('should return 401 if user is not authenticated', async () => {
            const { createClient } = await import('@/lib/supabase/server');
            const mockSupabase = createClient();

            // @ts-ignore
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: new Error('Not authenticated'),
            });

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('UNAUTHORIZED');
        });

        it('should return affiliates list for authenticated user', async () => {
            const { createClient } = await import('@/lib/supabase/server');
            const { AffiliateService } = await import('@/lib/services/affiliate');

            const mockSupabase = createClient();
            const mockAffiliateService = new AffiliateService();

            // @ts-ignore
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'user-1', email: 'test@example.com' } },
                error: null,
            });

            const mockAffiliatesData = {
                affiliates: [
                    {
                        id: 'affiliate-1',
                        userId: 'user-1',
                        affiliateCode: 'TEST123',
                        commissionRate: 0.1,
                        totalEarnings: 100,
                        totalReferrals: 5,
                        status: 'active',
                        createdAt: '2024-01-01T00:00:00Z',
                        updatedAt: '2024-01-01T00:00:00Z',
                    },
                ],
                total: 1,
                page: 1,
                limit: 20,
            };

            // @ts-ignore
            mockAffiliateService.getAffiliates.mockResolvedValue(mockAffiliatesData);

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toEqual(mockAffiliatesData);
        });
    });

    describe('POST /api/affiliates', () => {
        it('should return 401 if user is not authenticated', async () => {
            const { createClient } = await import('@/lib/supabase/server');
            const mockSupabase = createClient();

            // @ts-ignore
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: new Error('Not authenticated'),
            });

            const requestWithBody = new NextRequest('http://localhost:3000/api/affiliates', {
                method: 'POST',
                body: JSON.stringify({
                    payoutMethod: 'paypal',
                    payoutDetails: { email: 'test@example.com' },
                }),
            });

            const response = await POST(requestWithBody);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('UNAUTHORIZED');
        });

        it('should create affiliate account for authenticated user', async () => {
            const { createClient } = await import('@/lib/supabase/server');
            const { AffiliateService } = await import('@/lib/services/affiliate');

            const mockSupabase = createClient();
            const mockAffiliateService = new AffiliateService();

            // @ts-ignore
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'user-1', email: 'test@example.com' } },
                error: null,
            });

            // @ts-ignore
            mockAffiliateService.getAffiliate.mockResolvedValue(null); // No existing affiliate

            const mockCreatedAffiliate = {
                id: 'affiliate-1',
                userId: 'user-1',
                affiliateCode: 'TEST123',
                commissionRate: 0.1,
                totalEarnings: 0,
                totalReferrals: 0,
                status: 'active',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
            };

            // @ts-ignore
            mockAffiliateService.createAffiliate.mockResolvedValue(mockCreatedAffiliate);

            const requestWithBody = new NextRequest('http://localhost:3000/api/affiliates', {
                method: 'POST',
                body: JSON.stringify({
                    payoutMethod: 'paypal',
                    payoutDetails: { email: 'test@example.com' },
                }),
            });

            const response = await POST(requestWithBody);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.data).toEqual(mockCreatedAffiliate);
        });

        it('should return 409 if user already has affiliate account', async () => {
            const { createClient } = await import('@/lib/supabase/server');
            const { AffiliateService } = await import('@/lib/services/affiliate');

            const mockSupabase = createClient();
            const mockAffiliateService = new AffiliateService();

            // @ts-ignore
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'user-1', email: 'test@example.com' } },
                error: null,
            });

            const existingAffiliate = {
                id: 'affiliate-1',
                userId: 'user-1',
                affiliateCode: 'EXISTING123',
                commissionRate: 0.1,
                totalEarnings: 100,
                totalReferrals: 5,
                status: 'active',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
            };

            // @ts-ignore
            mockAffiliateService.getAffiliate.mockResolvedValue(existingAffiliate);

            const requestWithBody = new NextRequest('http://localhost:3000/api/affiliates', {
                method: 'POST',
                body: JSON.stringify({
                    payoutMethod: 'paypal',
                    payoutDetails: { email: 'test@example.com' },
                }),
            });

            const response = await POST(requestWithBody);
            const data = await response.json();

            expect(response.status).toBe(409);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('ALREADY_EXISTS');
        });

        it('should validate request body', async () => {
            const { createClient } = await import('@/lib/supabase/server');
            const mockSupabase = createClient();

            // @ts-ignore
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'user-1', email: 'test@example.com' } },
                error: null,
            });

            const requestWithInvalidBody = new NextRequest('http://localhost:3000/api/affiliates', {
                method: 'POST',
                body: JSON.stringify({
                    payoutMethod: 'invalid_method', // Invalid payout method
                }),
            });

            const response = await POST(requestWithInvalidBody);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
        });
    });
});