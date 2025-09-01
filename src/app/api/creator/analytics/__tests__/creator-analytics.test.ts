import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock the creator analytics service
jest.mock('@/lib/analytics/creator-analytics-service', () => ({
    creatorAnalyticsService: {
        getCreatorAnalytics: jest.fn(),
        createCustomReport: jest.fn(),
    },
}));

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(() => ({
        auth: {
            getUser: jest.fn(),
        },
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(),
                })),
            })),
        })),
    })),
}));

describe('/api/creator/analytics', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/creator/analytics', () => {
        it('should return creator analytics data for authenticated user', async () => {
            const { createClient } = require('@/lib/supabase/server');
            const { creatorAnalyticsService } = require('@/lib/analytics/creator-analytics-service');

            const mockSupabase = createClient();
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'creator-123' } },
                error: null,
            });

            creatorAnalyticsService.getCreatorAnalytics.mockResolvedValue({
                overview: {
                    totalProducts: 5,
                    totalRevenue: 1500,
                    totalSales: 25,
                    totalViews: 1000,
                    conversionRate: 0.025,
                    averageRating: 4.5,
                    followerCount: 150,
                    growthRate: 0.15,
                    topMetrics: [],
                },
                products: {
                    topProducts: [],
                    productPerformance: [],
                    categoryBreakdown: [],
                    recentProducts: [],
                },
                revenue: {
                    totalRevenue: 1500,
                    monthlyRevenue: 500,
                    revenueGrowth: [],
                    revenueByProduct: [],
                    revenueByMonth: [],
                    payoutHistory: [],
                    pendingPayouts: 300,
                    nextPayoutDate: new Date(),
                },
                audience: {
                    totalFollowers: 150,
                    followerGrowth: [],
                    audienceDemographics: {
                        countries: [],
                        ageGroups: [],
                        interests: [],
                    },
                    engagementMetrics: {
                        averageEngagementRate: 0.05,
                        totalLikes: 100,
                        totalComments: 50,
                        totalShares: 25,
                        engagementTrend: [],
                    },
                    topReferrers: [],
                },
                performance: {
                    productViews: 800,
                    profileViews: 200,
                    searchAppearances: 50,
                    clickThroughRate: 0.1,
                    bounceRate: 0.3,
                    averageSessionDuration: 180,
                    topPerformingContent: [],
                },
            });

            const request = new NextRequest('http://localhost:3000/api/creator/analytics');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toBeDefined();
            expect(data.data.overview.totalRevenue).toBe(1500);
        });

        it('should return 401 for unauthenticated user', async () => {
            const { createClient } = require('@/lib/supabase/server');

            const mockSupabase = createClient();
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: new Error('Not authenticated'),
            });

            const request = new NextRequest('http://localhost:3000/api/creator/analytics');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Unauthorized');
        });

        it('should handle date range filters', async () => {
            const { createClient } = require('@/lib/supabase/server');
            const { creatorAnalyticsService } = require('@/lib/analytics/creator-analytics-service');

            const mockSupabase = createClient();
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'creator-123' } },
                error: null,
            });

            creatorAnalyticsService.getCreatorAnalytics.mockResolvedValue({});

            const url = 'http://localhost:3000/api/creator/analytics?start_date=2024-01-01&end_date=2024-01-31';
            const request = new NextRequest(url);
            const response = await GET(request);

            expect(creatorAnalyticsService.getCreatorAnalytics).toHaveBeenCalledWith(
                'creator-123',
                expect.objectContaining({
                    dateRange: {
                        start: new Date('2024-01-01'),
                        end: new Date('2024-01-31'),
                    },
                })
            );
        });

        it('should allow admin to view other creator analytics', async () => {
            const { createClient } = require('@/lib/supabase/server');
            const { creatorAnalyticsService } = require('@/lib/analytics/creator-analytics-service');

            const mockSupabase = createClient();
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'admin-123' } },
                error: null,
            });

            mockSupabase.from.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { role: 'admin' },
                            error: null,
                        }),
                    }),
                }),
            });

            creatorAnalyticsService.getCreatorAnalytics.mockResolvedValue({});

            const url = 'http://localhost:3000/api/creator/analytics?creator_id=other-creator-123';
            const request = new NextRequest(url);
            const response = await GET(request);

            expect(response.status).toBe(200);
            expect(creatorAnalyticsService.getCreatorAnalytics).toHaveBeenCalledWith(
                'other-creator-123',
                expect.any(Object)
            );
        });
    });

    describe('POST /api/creator/analytics', () => {
        it('should create a creator goal', async () => {
            const { createClient } = require('@/lib/supabase/server');

            const mockSupabase = createClient();
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'creator-123' } },
                error: null,
            });

            mockSupabase.from.mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: {
                                id: 'goal-123',
                                creator_id: 'creator-123',
                                name: 'Revenue Goal',
                                type: 'revenue',
                                target: 5000,
                                current: 1500,
                                deadline: '2024-12-31',
                                status: 'active',
                            },
                            error: null,
                        }),
                    }),
                }),
            });

            const requestBody = {
                action: 'create_goal',
                name: 'Revenue Goal',
                type: 'revenue',
                target: 5000,
                deadline: '2024-12-31',
            };

            const request = new NextRequest('http://localhost:3000/api/creator/analytics', {
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
            expect(data.data.id).toBe('goal-123');
        });

        it('should update an existing goal', async () => {
            const { createClient } = require('@/lib/supabase/server');

            const mockSupabase = createClient();
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'creator-123' } },
                error: null,
            });

            mockSupabase.from.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            select: jest.fn().mockReturnValue({
                                single: jest.fn().mockResolvedValue({
                                    data: {
                                        id: 'goal-123',
                                        name: 'Updated Revenue Goal',
                                        current: 2000,
                                    },
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            });

            const requestBody = {
                action: 'update_goal',
                id: 'goal-123',
                name: 'Updated Revenue Goal',
                current: 2000,
            };

            const request = new NextRequest('http://localhost:3000/api/creator/analytics', {
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
            expect(data.data.name).toBe('Updated Revenue Goal');
        });

        it('should return 400 for invalid action', async () => {
            const { createClient } = require('@/lib/supabase/server');

            const mockSupabase = createClient();
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'creator-123' } },
                error: null,
            });

            const requestBody = {
                action: 'invalid_action',
            };

            const request = new NextRequest('http://localhost:3000/api/creator/analytics', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Invalid action');
        });
    });

    describe('Error handling', () => {
        it('should handle service errors gracefully', async () => {
            const { createClient } = require('@/lib/supabase/server');
            const { creatorAnalyticsService } = require('@/lib/analytics/creator-analytics-service');

            const mockSupabase = createClient();
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: 'creator-123' } },
                error: null,
            });

            creatorAnalyticsService.getCreatorAnalytics.mockRejectedValue(new Error('Database error'));

            const request = new NextRequest('http://localhost:3000/api/creator/analytics');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to fetch creator analytics data');
        });
    });
});