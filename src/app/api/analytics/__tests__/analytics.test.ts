import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock the analytics service
jest.mock('@/lib/analytics/analytics-service', () => ({
    analyticsService: {
        getDashboardData: jest.fn(),
        createCustomReport: jest.fn(),
    },
}));

// Mock the API validation
jest.mock('@/lib/auth/api-validation', () => ({
    validateApiKey: jest.fn(),
}));

describe('/api/analytics', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/analytics', () => {
        it('should return analytics dashboard data', async () => {
            const { validateApiKey } = require('@/lib/auth/api-validation');
            const { analyticsService } = require('@/lib/analytics/analytics-service');

            validateApiKey.mockResolvedValue({ isValid: true });
            analyticsService.getDashboardData.mockResolvedValue({
                overview: {
                    totalUsers: 1000,
                    totalRevenue: 50000,
                    totalProducts: 100,
                    conversionRate: 0.05,
                    growthRate: 0.15,
                    topMetrics: [],
                },
                userBehavior: {
                    sessionDuration: 180,
                    pageViews: 4.2,
                    bounceRate: 0.35,
                    topPages: [],
                    userJourney: [],
                    heatmapData: [],
                },
                revenue: {
                    totalRevenue: 50000,
                    monthlyRecurringRevenue: 15000,
                    averageOrderValue: 125,
                    customerLifetimeValue: 500,
                    churnRate: 0.05,
                    conversionRate: 0.05,
                    revenueBySource: [],
                    revenueByProduct: [],
                    revenueGrowth: [],
                },
                performance: {
                    pageLoadTime: 1.2,
                    timeToInteractive: 2.1,
                    firstContentfulPaint: 0.8,
                    largestContentfulPaint: 1.5,
                    cumulativeLayoutShift: 0.1,
                    firstInputDelay: 0.05,
                    bounceRate: 0.35,
                    sessionDuration: 180,
                },
                conversion: {
                    funnelData: [],
                    conversionsBySource: [],
                    goalCompletions: [],
                    abTestResults: [],
                },
            });

            const request = new NextRequest('http://localhost:3000/api/analytics');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toBeDefined();
            expect(data.data.overview.totalUsers).toBe(1000);
        });

        it('should return 401 for invalid API key', async () => {
            const { validateApiKey } = require('@/lib/auth/api-validation');

            validateApiKey.mockResolvedValue({
                isValid: false,
                error: 'Invalid API key'
            });

            const request = new NextRequest('http://localhost:3000/api/analytics');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Invalid API key');
        });

        it('should handle date range filters', async () => {
            const { validateApiKey } = require('@/lib/auth/api-validation');
            const { analyticsService } = require('@/lib/analytics/analytics-service');

            validateApiKey.mockResolvedValue({ isValid: true });
            analyticsService.getDashboardData.mockResolvedValue({});

            const url = 'http://localhost:3000/api/analytics?start_date=2024-01-01&end_date=2024-01-31';
            const request = new NextRequest(url);
            const response = await GET(request);

            expect(analyticsService.getDashboardData).toHaveBeenCalledWith(
                expect.objectContaining({
                    dateRange: {
                        start: new Date('2024-01-01'),
                        end: new Date('2024-01-31'),
                    },
                })
            );
        });
    });

    describe('POST /api/analytics', () => {
        it('should create a custom report', async () => {
            const { validateApiKey } = require('@/lib/auth/api-validation');
            const { analyticsService } = require('@/lib/analytics/analytics-service');

            validateApiKey.mockResolvedValue({ isValid: true });
            analyticsService.createCustomReport.mockResolvedValue({
                id: 'report-123',
                name: 'Test Report',
                description: 'Test Description',
                metrics: ['revenue', 'users'],
                dimensions: ['date', 'source'],
                filters: {},
                format: 'csv',
                recipients: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const requestBody = {
                action: 'create_report',
                name: 'Test Report',
                description: 'Test Description',
                metrics: ['revenue', 'users'],
                dimensions: ['date', 'source'],
                format: 'csv',
                recipients: [],
            };

            const request = new NextRequest('http://localhost:3000/api/analytics', {
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
            expect(data.data.id).toBe('report-123');
        });

        it('should track events', async () => {
            const { validateApiKey } = require('@/lib/auth/api-validation');

            validateApiKey.mockResolvedValue({ isValid: true });

            const requestBody = {
                action: 'track_event',
                event: 'button_click',
                properties: { button_id: 'cta-button' },
            };

            const request = new NextRequest('http://localhost:3000/api/analytics', {
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
            expect(data.message).toBe('Event tracked');
        });

        it('should return 400 for invalid action', async () => {
            const { validateApiKey } = require('@/lib/auth/api-validation');

            validateApiKey.mockResolvedValue({ isValid: true });

            const requestBody = {
                action: 'invalid_action',
            };

            const request = new NextRequest('http://localhost:3000/api/analytics', {
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
            const { validateApiKey } = require('@/lib/auth/api-validation');
            const { analyticsService } = require('@/lib/analytics/analytics-service');

            validateApiKey.mockResolvedValue({ isValid: true });
            analyticsService.getDashboardData.mockRejectedValue(new Error('Database error'));

            const request = new NextRequest('http://localhost:3000/api/analytics');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to fetch analytics data');
        });
    });
});