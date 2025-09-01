import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { SubscriptionIntelligenceService } from '@/lib/services/subscription-intelligence';

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn(() => ({
                data: { user: { id: 'test-user-id' } },
                error: null,
            })),
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => ({
                        data: {
                            subscription_tier: 'free',
                            usage_ai_requests: 5,
                            usage_products: 2,
                            usage_marketplace_listings: 1,
                            usage_file_uploads: 3,
                            usage_storage_bytes: 50000000,
                            created_at: '2024-01-01T00:00:00Z',
                        },
                        error: null,
                    })),
                })),
            })),
        })),
    })),
}));

// Mock the SubscriptionIntelligenceService
vi.mock('@/lib/services/subscription-intelligence', () => ({
    SubscriptionIntelligenceService: vi.fn(() => ({
        generateIntelligence: vi.fn(() => Promise.resolve({
            userId: 'test-user-id',
            currentTier: 'free',
            usagePatterns: {
                aiRequests: {
                    current: 5,
                    limit: 10,
                    percentage: 50,
                    trend: 'increasing',
                    weeklyAverage: 4,
                    monthlyAverage: 5,
                    peakUsage: 8,
                    projectedMonthly: 7,
                },
                products: {
                    current: 2,
                    limit: 3,
                    percentage: 67,
                    trend: 'stable',
                    weeklyAverage: 2,
                    monthlyAverage: 2,
                    peakUsage: 3,
                    projectedMonthly: 2,
                },
                marketplaceListings: {
                    current: 1,
                    limit: 1,
                    percentage: 100,
                    trend: 'stable',
                    weeklyAverage: 1,
                    monthlyAverage: 1,
                    peakUsage: 1,
                    projectedMonthly: 1,
                },
                fileUploads: {
                    current: 3,
                    limit: 5,
                    percentage: 60,
                    trend: 'decreasing',
                    weeklyAverage: 2,
                    monthlyAverage: 3,
                    peakUsage: 5,
                    projectedMonthly: 2,
                },
                storage: {
                    current: 50000000,
                    limit: 104857600,
                    percentage: 48,
                    trend: 'increasing',
                    weeklyAverage: 45000000,
                    monthlyAverage: 50000000,
                    peakUsage: 60000000,
                    projectedMonthly: 55000000,
                },
                loginFrequency: 4.5,
                featureUsage: {
                    ai_scraping: 15,
                    product_creation: 8,
                    marketplace_listing: 3,
                    analytics_dashboard: 12,
                },
                timeOfDayUsage: {
                    '9': 5,
                    '14': 8,
                    '20': 3,
                },
                weeklyTrends: [
                    {
                        week: '2024-W50',
                        usage: { ai_requests: 5, products: 2 },
                        totalActivity: 45,
                    },
                ],
                monthlyGrowth: 0.15,
            },
            recommendations: [
                {
                    type: 'upgrade',
                    tier: 'pro',
                    interval: 'monthly',
                    confidence: 85,
                    reasoning: ['High usage approaching limits', 'Growing usage trend'],
                    potentialValue: 200,
                    urgency: 'medium',
                    validUntil: '2024-12-21T00:00:00Z',
                },
            ],
            churnRisk: {
                riskLevel: 'low',
                score: 25,
                factors: [
                    {
                        factor: 'growing_usage',
                        impact: 'positive',
                        weight: -0.2,
                        description: 'Usage is growing by 15% monthly',
                    },
                ],
                retentionActions: [],
                confidence: 85,
            },
            personalizedOffers: [
                {
                    id: 'new-user-test-user-id',
                    type: 'discount',
                    title: 'New User Special: 50% Off Pro Plan',
                    description: 'Get 50% off your first month of Pro to unlock unlimited features',
                    value: 50,
                    originalPrice: 29,
                    discountedPrice: 14.50,
                    discountPercentage: 50,
                    validUntil: '2024-12-21T00:00:00Z',
                    conditions: ['Valid for first-time Pro subscribers only'],
                    targetSegment: 'new_user',
                    priority: 'high',
                    estimatedConversion: 25,
                },
            ],
            optimizationSuggestions: [
                {
                    type: 'features',
                    title: 'Discover Unused Features',
                    description: 'You haven\'t used 3 powerful features that could boost your productivity.',
                    impact: 'feature_discovery',
                    potentialValue: 100,
                    difficulty: 'easy',
                    estimatedTime: '10 minutes',
                    steps: ['Try the Custom Branding feature', 'Try the Bulk Operations feature'],
                },
            ],
        })),
        generateDynamicPricing: vi.fn(() => Promise.resolve({
            userId: 'test-user-id',
            basePrice: 29,
            adjustedPrice: 20.30,
            adjustmentFactor: 0.7,
            reasoning: [
                {
                    factor: 'new_user_discount',
                    adjustment: 0.7,
                    reasoning: 'First-time user incentive',
                },
            ],
            validUntil: '2024-12-21T00:00:00Z',
            segment: {
                type: 'new_user',
                characteristics: ['Recently joined', 'Exploring features'],
                typicalBehavior: ['High initial activity', 'Feature discovery'],
                recommendedStrategy: 'Onboarding and education focus',
            },
        })),
    })),
}));

describe('/api/subscription-intelligence', () => {
    let mockRequest: NextRequest;

    beforeEach(() => {
        vi.clearAllMocks();
        mockRequest = new NextRequest('http://localhost:3000/api/subscription-intelligence');
    });

    describe('GET', () => {
        it('should return subscription intelligence data', async () => {
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toBeDefined();
            expect(data.data.userId).toBe('test-user-id');
            expect(data.data.currentTier).toBe('free');
            expect(data.data.usagePatterns).toBeDefined();
            expect(data.data.recommendations).toBeDefined();
            expect(data.data.churnRisk).toBeDefined();
            expect(data.data.personalizedOffers).toBeDefined();
        });

        it('should filter response based on query parameters', async () => {
            const url = new URL('http://localhost:3000/api/subscription-intelligence');
            url.searchParams.set('includeRecommendations', 'false');
            url.searchParams.set('includeChurnAnalysis', 'false');

            const requestWithParams = new NextRequest(url);
            const response = await GET(requestWithParams);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.data.recommendations).toBeUndefined();
            expect(data.data.churnRisk).toBeUndefined();
            expect(data.data.personalizedOffers).toBeDefined(); // Default true
        });

        it('should return 401 for unauthenticated requests', async () => {
            // Mock unauthenticated user
            vi.mocked(require('@/lib/supabase/server').createClient).mockReturnValue({
                auth: {
                    getUser: vi.fn(() => ({
                        data: { user: null },
                        error: new Error('Unauthorized'),
                    })),
                },
            });

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Unauthorized');
        });
    });

    describe('POST', () => {
        it('should generate custom intelligence with dynamic pricing', async () => {
            const requestBody = {
                includeRecommendations: true,
                includeChurnAnalysis: true,
                includePersonalizedOffers: true,
                includeDynamicPricing: true,
                timeframe: 'month',
            };

            const postRequest = new NextRequest('http://localhost:3000/api/subscription-intelligence', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response = await POST(postRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.dynamicPricing).toBeDefined();
            expect(data.data.dynamicPricing.adjustedPrice).toBe(20.30);
            expect(data.data.dynamicPricing.segment.type).toBe('new_user');
        });

        it('should validate request body', async () => {
            const invalidRequestBody = {
                includeRecommendations: 'invalid', // Should be boolean
                timeframe: 'invalid', // Should be enum
            };

            const postRequest = new NextRequest('http://localhost:3000/api/subscription-intelligence', {
                method: 'POST',
                body: JSON.stringify(invalidRequestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response = await POST(postRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toBe('Invalid request data');
            expect(data.details).toBeDefined();
        });

        it('should handle service errors gracefully', async () => {
            // Mock service error
            const mockService = vi.mocked(SubscriptionIntelligenceService);
            mockService.prototype.generateIntelligence = vi.fn(() =>
                Promise.reject(new Error('Service unavailable'))
            );

            const requestBody = {
                includeRecommendations: true,
            };

            const postRequest = new NextRequest('http://localhost:3000/api/subscription-intelligence', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response = await POST(postRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Internal server error');
        });
    });
});

describe('SubscriptionIntelligenceService', () => {
    let service: SubscriptionIntelligenceService;

    beforeEach(() => {
        service = new SubscriptionIntelligenceService();
    });

    describe('generateIntelligence', () => {
        it('should generate comprehensive intelligence data', async () => {
            const intelligence = await service.generateIntelligence('test-user-id');

            expect(intelligence).toBeDefined();
            expect(intelligence.userId).toBe('test-user-id');
            expect(intelligence.currentTier).toBe('free');
            expect(intelligence.usagePatterns).toBeDefined();
            expect(intelligence.recommendations).toBeDefined();
            expect(intelligence.churnRisk).toBeDefined();
            expect(intelligence.personalizedOffers).toBeDefined();
            expect(intelligence.optimizationSuggestions).toBeDefined();
        });

        it('should include usage patterns with trends', async () => {
            const intelligence = await service.generateIntelligence('test-user-id');

            expect(intelligence.usagePatterns.aiRequests.trend).toBe('increasing');
            expect(intelligence.usagePatterns.products.trend).toBe('stable');
            expect(intelligence.usagePatterns.fileUploads.trend).toBe('decreasing');
            expect(intelligence.usagePatterns.monthlyGrowth).toBe(0.15);
        });

        it('should generate appropriate recommendations', async () => {
            const intelligence = await service.generateIntelligence('test-user-id');

            expect(intelligence.recommendations).toHaveLength(1);
            expect(intelligence.recommendations[0].type).toBe('upgrade');
            expect(intelligence.recommendations[0].tier).toBe('pro');
            expect(intelligence.recommendations[0].confidence).toBe(85);
        });

        it('should assess churn risk correctly', async () => {
            const intelligence = await service.generateIntelligence('test-user-id');

            expect(intelligence.churnRisk.riskLevel).toBe('low');
            expect(intelligence.churnRisk.score).toBe(25);
            expect(intelligence.churnRisk.factors).toHaveLength(1);
            expect(intelligence.churnRisk.factors[0].impact).toBe('positive');
        });

        it('should generate personalized offers', async () => {
            const intelligence = await service.generateIntelligence('test-user-id');

            expect(intelligence.personalizedOffers).toHaveLength(1);
            expect(intelligence.personalizedOffers[0].type).toBe('discount');
            expect(intelligence.personalizedOffers[0].discountPercentage).toBe(50);
            expect(intelligence.personalizedOffers[0].priority).toBe('high');
        });

        it('should provide optimization suggestions', async () => {
            const intelligence = await service.generateIntelligence('test-user-id');

            expect(intelligence.optimizationSuggestions).toHaveLength(1);
            expect(intelligence.optimizationSuggestions[0].type).toBe('features');
            expect(intelligence.optimizationSuggestions[0].impact).toBe('feature_discovery');
            expect(intelligence.optimizationSuggestions[0].difficulty).toBe('easy');
        });
    });

    describe('generateDynamicPricing', () => {
        it('should generate dynamic pricing for new users', async () => {
            const pricing = await service.generateDynamicPricing('test-user-id');

            expect(pricing.userId).toBe('test-user-id');
            expect(pricing.basePrice).toBe(29);
            expect(pricing.adjustedPrice).toBe(20.30);
            expect(pricing.adjustmentFactor).toBe(0.7);
            expect(pricing.segment.type).toBe('new_user');
        });

        it('should include pricing factors and reasoning', async () => {
            const pricing = await service.generateDynamicPricing('test-user-id');

            expect(pricing.reasoning).toHaveLength(1);
            expect(pricing.reasoning[0].factor).toBe('new_user_discount');
            expect(pricing.reasoning[0].adjustment).toBe(0.7);
            expect(pricing.reasoning[0].reasoning).toBe('First-time user incentive');
        });

        it('should set appropriate validity period', async () => {
            const pricing = await service.generateDynamicPricing('test-user-id');

            const validUntil = new Date(pricing.validUntil);
            const now = new Date();
            const daysDiff = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            expect(daysDiff).toBe(7); // Valid for 7 days
        });
    });
});