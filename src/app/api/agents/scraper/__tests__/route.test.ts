import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, PUT, GET, DELETE } from '../route';

// Mock Supabase
const mockSupabaseClient = {
    auth: {
        getUser: vi.fn()
    },
    from: vi.fn(() => ({
        insert: vi.fn(() => ({ error: null })),
        select: vi.fn(() => ({
            eq: vi.fn(() => ({
                single: vi.fn()
            }))
        }))
    }))
};

vi.mock('@/lib/supabase/server', () => ({
    createClient: () => mockSupabaseClient
}));

// Mock ScrapingAgent
const mockScrapingAgent = {
    scrapeProduct: vi.fn(),
    scrapeMultipleProducts: vi.fn(),
    getStats: vi.fn(),
    getSupportedSources: vi.fn(),
    resetStats: vi.fn()
};

vi.mock('@/lib/scraping/scraping-agent', () => ({
    ScrapingAgent: vi.fn(() => mockScrapingAgent)
}));

// Mock environment variables
vi.mock('process', () => ({
    env: {
        FIRECRAWL_API_KEY: 'test-api-key',
        NODE_ENV: 'test'
    }
}));

describe('/api/agents/scraper', () => {
    const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Default to authenticated user
        mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('POST /api/agents/scraper', () => {
        it('should scrape a product successfully', async () => {
            const mockScrapingResult = {
                success: true,
                data: {
                    id: 'prod-123',
                    url: 'https://etsy.com/listing/123456/test-product',
                    source: 'Etsy',
                    title: 'Test Product',
                    description: 'A test product description',
                    pricing: { type: 'one-time', amount: 29.99, currency: 'USD' },
                    features: ['Feature 1', 'Feature 2'],
                    images: ['https://example.com/image1.jpg'],
                    content: 'Product content here',
                    metadata: { category: 'digital-product', tags: [], language: 'en' },
                    scrapedAt: new Date(),
                    status: 'success'
                },
                metadata: {
                    requestId: 'req-123',
                    duration: 5000,
                    tokensUsed: 0,
                    cost: 0,
                    rateLimitRemaining: 99,
                    retryCount: 0
                }
            };

            mockScrapingAgent.scrapeProduct.mockResolvedValue(mockScrapingResult);

            const request = new NextRequest('http://localhost:3000/api/agents/scraper', {
                method: 'POST',
                body: JSON.stringify({
                    url: 'https://etsy.com/listing/123456/test-product',
                    options: {
                        includeImages: true,
                        includeMetadata: true
                    },
                    priority: 'normal'
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.title).toBe('Test Product');
            expect(mockScrapingAgent.scrapeProduct).toHaveBeenCalledWith({
                url: 'https://etsy.com/listing/123456/test-product',
                source: undefined,
                options: {
                    includeImages: true,
                    includeMetadata: true
                },
                priority: 'normal',
                userId: mockUser.id
            });
        });

        it('should return 401 for unauthenticated requests', async () => {
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: new Error('Not authenticated')
            });

            const request = new NextRequest('http://localhost:3000/api/agents/scraper', {
                method: 'POST',
                body: JSON.stringify({
                    url: 'https://etsy.com/listing/123456/test-product'
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('UNAUTHORIZED');
        });

        it('should return 400 for invalid request data', async () => {
            const request = new NextRequest('http://localhost:3000/api/agents/scraper', {
                method: 'POST',
                body: JSON.stringify({
                    url: 'not-a-valid-url',
                    priority: 'invalid-priority'
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('VALIDATION_ERROR');
        });

        it('should handle scraping failures', async () => {
            const mockFailureResult = {
                success: false,
                error: {
                    code: 'SCRAPING_FAILED',
                    message: 'Failed to scrape product',
                    details: 'Network error'
                },
                metadata: {
                    requestId: 'req-123',
                    duration: 1000,
                    tokensUsed: 0,
                    cost: 0,
                    rateLimitRemaining: 99,
                    retryCount: 1
                }
            };

            mockScrapingAgent.scrapeProduct.mockResolvedValue(mockFailureResult);

            const request = new NextRequest('http://localhost:3000/api/agents/scraper', {
                method: 'POST',
                body: JSON.stringify({
                    url: 'https://etsy.com/listing/123456/test-product'
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('SCRAPING_FAILED');
        });
    });

    describe('PUT /api/agents/scraper (batch)', () => {
        it('should scrape multiple products successfully', async () => {
            const mockBatchResults = [
                {
                    success: true,
                    data: {
                        id: 'prod-1',
                        url: 'https://etsy.com/listing/123456/product-1',
                        title: 'Product 1',
                        source: 'Etsy',
                        description: 'Description 1',
                        pricing: { type: 'one-time', amount: 19.99, currency: 'USD' },
                        features: [],
                        images: [],
                        content: 'Content 1',
                        metadata: { category: 'digital-product', tags: [], language: 'en' },
                        scrapedAt: new Date(),
                        status: 'success'
                    },
                    metadata: {
                        requestId: 'req-1',
                        duration: 3000,
                        tokensUsed: 0,
                        cost: 0,
                        rateLimitRemaining: 98,
                        retryCount: 0
                    }
                },
                {
                    success: true,
                    data: {
                        id: 'prod-2',
                        url: 'https://gumroad.com/l/product-2',
                        title: 'Product 2',
                        source: 'Gumroad',
                        description: 'Description 2',
                        pricing: { type: 'one-time', amount: 39.99, currency: 'USD' },
                        features: [],
                        images: [],
                        content: 'Content 2',
                        metadata: { category: 'digital-product', tags: [], language: 'en' },
                        scrapedAt: new Date(),
                        status: 'success'
                    },
                    metadata: {
                        requestId: 'req-2',
                        duration: 4000,
                        tokensUsed: 0,
                        cost: 0,
                        rateLimitRemaining: 97,
                        retryCount: 0
                    }
                }
            ];

            mockScrapingAgent.scrapeMultipleProducts.mockResolvedValue(mockBatchResults);

            const request = new NextRequest('http://localhost:3000/api/agents/scraper', {
                method: 'PUT',
                body: JSON.stringify({
                    urls: [
                        'https://etsy.com/listing/123456/product-1',
                        'https://gumroad.com/l/product-2'
                    ],
                    options: {
                        includeImages: true
                    },
                    priority: 'normal'
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.results).toHaveLength(2);
            expect(data.data.summary.total).toBe(2);
            expect(data.data.summary.successful).toBe(2);
            expect(data.data.summary.failed).toBe(0);
        });

        it('should handle mixed success/failure in batch', async () => {
            const mockMixedResults = [
                {
                    success: true,
                    data: {
                        id: 'prod-1',
                        url: 'https://etsy.com/listing/123456/product-1',
                        title: 'Product 1',
                        source: 'Etsy',
                        description: 'Description 1',
                        pricing: { type: 'one-time', amount: 19.99, currency: 'USD' },
                        features: [],
                        images: [],
                        content: 'Content 1',
                        metadata: { category: 'digital-product', tags: [], language: 'en' },
                        scrapedAt: new Date(),
                        status: 'success'
                    },
                    metadata: {
                        requestId: 'req-1',
                        duration: 3000,
                        tokensUsed: 0,
                        cost: 0,
                        rateLimitRemaining: 98,
                        retryCount: 0
                    }
                },
                {
                    success: false,
                    error: {
                        code: 'SCRAPING_FAILED',
                        message: 'Failed to scrape',
                        details: 'Network error'
                    },
                    metadata: {
                        requestId: 'req-2',
                        duration: 1000,
                        tokensUsed: 0,
                        cost: 0,
                        rateLimitRemaining: 98,
                        retryCount: 1
                    }
                }
            ];

            mockScrapingAgent.scrapeMultipleProducts.mockResolvedValue(mockMixedResults);

            const request = new NextRequest('http://localhost:3000/api/agents/scraper', {
                method: 'PUT',
                body: JSON.stringify({
                    urls: [
                        'https://etsy.com/listing/123456/product-1',
                        'https://invalid-domain.com/product-2'
                    ]
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.summary.total).toBe(2);
            expect(data.data.summary.successful).toBe(1);
            expect(data.data.summary.failed).toBe(1);
        });

        it('should validate batch request limits', async () => {
            const tooManyUrls = Array.from({ length: 15 }, (_, i) =>
                `https://etsy.com/listing/${i}/product-${i}`
            );

            const request = new NextRequest('http://localhost:3000/api/agents/scraper', {
                method: 'PUT',
                body: JSON.stringify({
                    urls: tooManyUrls
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('VALIDATION_ERROR');
        });
    });

    describe('GET /api/agents/scraper/stats', () => {
        it('should return scraping statistics', async () => {
            const mockStats = {
                totalRequests: 100,
                successfulScrapes: 85,
                failedScrapes: 15,
                averageResponseTime: 4500,
                rateLimitHits: 5,
                errorsByType: {
                    'TIMEOUT': 8,
                    'NETWORK_ERROR': 7
                },
                sourceStats: {
                    'etsy': {
                        requests: 50,
                        successes: 45,
                        failures: 5,
                        avgResponseTime: 4000
                    }
                }
            };

            const mockSources = {
                etsy: { name: 'Etsy', domain: 'etsy.com' },
                gumroad: { name: 'Gumroad', domain: 'gumroad.com' }
            };

            mockScrapingAgent.getStats.mockReturnValue(mockStats);
            mockScrapingAgent.getSupportedSources.mockReturnValue(mockSources);

            const request = new NextRequest('http://localhost:3000/api/agents/scraper', {
                method: 'GET'
            });

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.stats).toEqual(mockStats);
            expect(data.data.supportedSources).toEqual(['etsy', 'gumroad']);
            expect(data.data.sourceDetails).toEqual(mockSources);
        });
    });

    describe('DELETE /api/agents/scraper/stats', () => {
        it('should reset statistics for enterprise users', async () => {
            mockSupabaseClient.from().select().eq().single.mockResolvedValue({
                data: { subscription_tier: 'enterprise' },
                error: null
            });

            const request = new NextRequest('http://localhost:3000/api/agents/scraper', {
                method: 'DELETE'
            });

            const response = await DELETE(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.message).toBe('Statistics reset successfully');
            expect(mockScrapingAgent.resetStats).toHaveBeenCalled();
        });

        it('should return 403 for non-enterprise users', async () => {
            mockSupabaseClient.from().select().eq().single.mockResolvedValue({
                data: { subscription_tier: 'pro' },
                error: null
            });

            const request = new NextRequest('http://localhost:3000/api/agents/scraper', {
                method: 'DELETE'
            });

            const response = await DELETE(request);
            const data = await response.json();

            expect(response.status).toBe(403);
            expect(data.success).toBe(false);
            expect(data.error.code).toBe('FORBIDDEN');
        });
    });
});