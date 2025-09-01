import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ScrapingAgent } from '../scraping-agent';
import { ScrapingRequest, ScrapingResult } from '../types';
import { SCRAPING_SOURCES } from '../sources';

// Set environment variables for tests
process.env.FIRECRAWL_API_KEY = 'test-api-key';
process.env.GOOGLE_AI_API_KEY = 'test-google-key';

// Mock Firecrawl
const mockScrapeUrl = vi.fn();
vi.mock('@mendable/firecrawl-js', () => ({
    default: vi.fn().mockImplementation(() => ({
        scrapeUrl: mockScrapeUrl
    }))
}));

describe('ScrapingAgent', () => {
    let scrapingAgent: ScrapingAgent;

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Create scraping agent
        scrapingAgent = new ScrapingAgent({
            firecrawlApiKey: 'test-api-key',
            defaultTimeout: 10000,
            maxRetries: 2,
            respectRateLimit: false // Disable for testing
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('scrapeProduct', () => {
        it('should successfully scrape a supported URL', async () => {
            // Mock successful Firecrawl response
            mockScrapeUrl.mockResolvedValue({
                success: true,
                data: {
                    markdown: '# Test Product\n\nThis is a test product description.\n\nPrice: $29.99',
                    html: '<h1>Test Product</h1><p>This is a test product description.</p><p>Price: $29.99</p>',
                    metadata: {
                        title: 'Test Product',
                        description: 'This is a test product description.',
                        language: 'en'
                    }
                }
            });

            const request: ScrapingRequest = {
                url: 'https://etsy.com/listing/123456/test-product',
                options: {
                    includeImages: true,
                    includeMetadata: true,
                    extractContent: false
                },
                priority: 'normal'
            };

            const result = await scrapingAgent.scrapeProduct(request);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.title).toBe('Test Product');
            expect(result.data?.source).toBe('Etsy');
            expect(result.data?.pricing.amount).toBe(29.99);
            expect(result.data?.pricing.currency).toBe('USD');
            expect(mockScrapeUrl).toHaveBeenCalledWith(
                request.url,
                expect.objectContaining({
                    formats: ['markdown', 'html'],
                    onlyMainContent: true,
                    timeout: 10000
                })
            );
        });

        it('should handle unsupported URLs', async () => {
            const request: ScrapingRequest = {
                url: 'https://unsupported-domain.com/product',
                priority: 'normal'
            };

            const result = await scrapingAgent.scrapeProduct(request);

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('SCRAPING_FAILED');
            expect(result.error?.message).toContain('Unsupported domain');
        });

        it('should handle invalid URLs', async () => {
            const request: ScrapingRequest = {
                url: 'not-a-valid-url',
                priority: 'normal'
            };

            const result = await scrapingAgent.scrapeProduct(request);

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('SCRAPING_FAILED');
            expect(result.error?.message).toBe('Invalid URL provided');
        });

        it('should handle Firecrawl failures', async () => {
            mockScrapeUrl.mockResolvedValue({
                success: false,
                error: 'Firecrawl service error'
            });

            const request: ScrapingRequest = {
                url: 'https://etsy.com/listing/123456/test-product',
                priority: 'normal'
            };

            const result = await scrapingAgent.scrapeProduct(request);

            expect(result.success).toBe(false);
            expect(result.error?.message).toContain('Firecrawl scraping failed');
        });

        it('should extract pricing information correctly', async () => {
            mockScrapeUrl.mockResolvedValue({
                success: true,
                data: {
                    markdown: '# Premium Course\n\nLearn advanced techniques.\n\n**Price: €49.99/month**',
                    html: '<h1>Premium Course</h1><p>Learn advanced techniques.</p><p><strong>Price: €49.99/month</strong></p>',
                    metadata: {
                        title: 'Premium Course',
                        description: 'Learn advanced techniques.',
                        language: 'en'
                    }
                }
            });

            const request: ScrapingRequest = {
                url: 'https://udemy.com/course/premium-course',
                priority: 'normal'
            };

            const result = await scrapingAgent.scrapeProduct(request);

            expect(result.success).toBe(true);
            expect(result.data?.pricing.amount).toBe(49.99);
            expect(result.data?.pricing.currency).toBe('EUR');
            expect(result.data?.pricing.type).toBe('subscription');
            expect(result.data?.pricing.interval).toBe('monthly');
        });

        it('should extract features from markdown lists', async () => {
            mockScrapeUrl.mockResolvedValue({
                success: true,
                data: {
                    markdown: `# Design Template
          
Features:
- High-quality graphics
- Easy to customize
- Multiple formats included
- Commercial license
- 24/7 support`,
                    html: '<h1>Design Template</h1>',
                    metadata: {
                        title: 'Design Template',
                        language: 'en'
                    }
                }
            });

            const request: ScrapingRequest = {
                url: 'https://creativemarket.com/item/123456/design-template',
                priority: 'normal'
            };

            const result = await scrapingAgent.scrapeProduct(request);

            expect(result.success).toBe(true);
            expect(result.data?.features).toContain('High-quality graphics');
            expect(result.data?.features).toContain('Easy to customize');
            expect(result.data?.features).toContain('Multiple formats included');
            expect(result.data?.features).toContain('Commercial license');
            expect(result.data?.features).toContain('24/7 support');
        });
    });

    describe('scrapeMultipleProducts', () => {
        it('should handle batch scraping successfully', async () => {
            mockScrapeUrl.mockResolvedValue({
                success: true,
                data: {
                    markdown: '# Test Product\n\nDescription here.\n\nPrice: $19.99',
                    html: '<h1>Test Product</h1><p>Description here.</p><p>Price: $19.99</p>',
                    metadata: {
                        title: 'Test Product',
                        description: 'Description here.',
                        language: 'en'
                    }
                }
            });

            const requests: ScrapingRequest[] = [
                {
                    url: 'https://etsy.com/listing/123456/product-1',
                    priority: 'normal'
                },
                {
                    url: 'https://gumroad.com/l/product-2',
                    priority: 'normal'
                }
            ];

            const results = await scrapingAgent.scrapeMultipleProducts(requests);

            expect(results).toHaveLength(2);
            expect(results.every(r => r.success)).toBe(true);
            expect(mockScrapeUrl).toHaveBeenCalledTimes(2);
        });

        it('should handle mixed success/failure in batch scraping', async () => {
            mockScrapeUrl
                .mockResolvedValueOnce({
                    success: true,
                    data: {
                        markdown: '# Product 1\n\nPrice: $10',
                        html: '<h1>Product 1</h1>',
                        metadata: { title: 'Product 1', language: 'en' }
                    }
                })
                .mockResolvedValueOnce({
                    success: false,
                    error: 'Failed to scrape'
                });

            const requests: ScrapingRequest[] = [
                {
                    url: 'https://etsy.com/listing/123456/product-1',
                    priority: 'normal'
                },
                {
                    url: 'https://etsy.com/listing/789012/product-2',
                    priority: 'normal'
                }
            ];

            const results = await scrapingAgent.scrapeMultipleProducts(requests);

            expect(results).toHaveLength(2);
            expect(results[0].success).toBe(true);
            expect(results[1].success).toBe(false);
        });
    });

    describe('utility methods', () => {
        it('should check if URL is supported', () => {
            expect(scrapingAgent.isUrlSupported('https://etsy.com/listing/123456')).toBe(true);
            expect(scrapingAgent.isUrlSupported('https://gumroad.com/l/product')).toBe(true);
            expect(scrapingAgent.isUrlSupported('https://unsupported.com/product')).toBe(false);
        });

        it('should return supported sources', () => {
            const sources = scrapingAgent.getSupportedSources();
            expect(sources).toEqual(SCRAPING_SOURCES);
            expect(Object.keys(sources)).toContain('etsy');
            expect(Object.keys(sources)).toContain('gumroad');
            expect(Object.keys(sources)).toContain('udemy');
        });

        it('should track statistics', async () => {
            mockScrapeUrl.mockResolvedValue({
                success: true,
                data: {
                    markdown: '# Test\n\nPrice: $10',
                    html: '<h1>Test</h1>',
                    metadata: { title: 'Test', language: 'en' }
                }
            });

            const initialStats = scrapingAgent.getStats();
            expect(initialStats.totalRequests).toBe(0);

            await scrapingAgent.scrapeProduct({
                url: 'https://etsy.com/listing/123456/test',
                priority: 'normal'
            });

            const updatedStats = scrapingAgent.getStats();
            expect(updatedStats.totalRequests).toBe(1);
            expect(updatedStats.successfulScrapes).toBe(1);
            expect(updatedStats.failedScrapes).toBe(0);
        });

        it('should reset statistics', async () => {
            mockScrapeUrl.mockResolvedValue({
                success: true,
                data: {
                    markdown: '# Test\n\nPrice: $10',
                    html: '<h1>Test</h1>',
                    metadata: { title: 'Test', language: 'en' }
                }
            });

            // Generate some stats
            await scrapingAgent.scrapeProduct({
                url: 'https://etsy.com/listing/123456/test',
                priority: 'normal'
            });

            let stats = scrapingAgent.getStats();
            expect(stats.totalRequests).toBe(1);

            // Reset stats
            scrapingAgent.resetStats();
            stats = scrapingAgent.getStats();
            expect(stats.totalRequests).toBe(0);
            expect(stats.successfulScrapes).toBe(0);
            expect(stats.failedScrapes).toBe(0);
        });
    });

    describe('process method (EnhancedBaseAgent interface)', () => {
        it('should process URL input correctly', async () => {
            mockScrapeUrl.mockResolvedValue({
                success: true,
                data: {
                    markdown: '# Test Product\n\nPrice: $25',
                    html: '<h1>Test Product</h1>',
                    metadata: { title: 'Test Product', language: 'en' }
                }
            });

            const result = await scrapingAgent.process('https://etsy.com/listing/123456/test');

            expect(result).toBeDefined();
            expect((result as ScrapingResult).success).toBe(true);
        });

        it('should reject invalid input', async () => {
            await expect(scrapingAgent.process({ invalid: 'input' }))
                .rejects.toThrow('Invalid input: expected a valid URL');
        });
    });
});