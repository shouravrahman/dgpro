import { describe, it, expect, vi } from 'vitest';
import { ScrapingAgent } from '../scraping-agent';
import { SCRAPING_SOURCES, getSourceByDomain, isSupportedUrl } from '../sources';
import { ScrapingRateLimiter } from '../rate-limiter';
import { ContentExtractor } from '../content-extractor';

// Set environment variables for tests
process.env.FIRECRAWL_API_KEY = 'test-api-key';
process.env.GOOGLE_AI_API_KEY = 'test-google-key';

describe('Scraping Integration Tests', () => {
    describe('Sources Configuration', () => {
        it('should have valid source configurations', () => {
            expect(Object.keys(SCRAPING_SOURCES)).toContain('etsy');
            expect(Object.keys(SCRAPING_SOURCES)).toContain('gumroad');
            expect(Object.keys(SCRAPING_SOURCES)).toContain('udemy');

            // Check each source has required properties
            Object.values(SCRAPING_SOURCES).forEach(source => {
                expect(source.name).toBeDefined();
                expect(source.domain).toBeDefined();
                expect(source.categories).toBeDefined();
                expect(source.rateLimit).toBeGreaterThan(0);
                expect(typeof source.respectRobots).toBe('boolean');
                expect(typeof source.useFirecrawl).toBe('boolean');
            });
        });

        it('should detect sources by domain correctly', () => {
            expect(getSourceByDomain('https://etsy.com/listing/123456')).toBeTruthy();
            expect(getSourceByDomain('https://www.etsy.com/listing/123456')).toBeTruthy();
            expect(getSourceByDomain('https://gumroad.com/l/product')).toBeTruthy();
            expect(getSourceByDomain('https://unsupported.com/product')).toBeNull();
        });

        it('should check URL support correctly', () => {
            expect(isSupportedUrl('https://etsy.com/listing/123456')).toBe(true);
            expect(isSupportedUrl('https://gumroad.com/l/product')).toBe(true);
            expect(isSupportedUrl('https://unsupported.com/product')).toBe(false);
            expect(isSupportedUrl('invalid-url')).toBe(false);
        });
    });

    describe('Rate Limiter Integration', () => {
        it('should be a singleton', () => {
            const limiter1 = ScrapingRateLimiter.getInstance();
            const limiter2 = ScrapingRateLimiter.getInstance();
            expect(limiter1).toBe(limiter2);
        });

        it('should handle rate limiting correctly', async () => {
            const limiter = ScrapingRateLimiter.getInstance();
            limiter.resetRateLimit('test-source');

            const result1 = await limiter.checkRateLimit('test-source', 2);
            expect(result1.allowed).toBe(true);
            expect(result1.rateLimitInfo.requestsRemaining).toBe(2);

            limiter.recordRequest('test-source');
            limiter.recordRequest('test-source');

            const result2 = await limiter.checkRateLimit('test-source', 2);
            expect(result2.allowed).toBe(false);
            expect(result2.rateLimitInfo.requestsRemaining).toBe(0);
        });
    });

    describe('Content Extractor Integration', () => {
        it('should extract content from various formats', () => {
            const extractor = new ContentExtractor();

            const html = '<h1>Test Product</h1><div class="description">Description here</div><span class="currency-value">$19.99</span>';
            const markdown = '# Test Product\n\nDescription here\n\nPrice: $19.99';

            // Use a simpler source configuration for testing
            const testSource = {
                name: 'Test',
                domain: 'test.com',
                categories: ['digital-product'],
                endpoints: ['product'],
                rateLimit: 100,
                respectRobots: true,
                useFirecrawl: true,
                selectors: {
                    title: 'h1',
                    description: '.description',
                    price: '.currency-value'
                }
            };

            const result = extractor.extractProductData(
                html,
                markdown,
                'https://test.com/product/123456',
                testSource
            );

            expect(result.title).toBe('Test Product');
            expect(result.description).toContain('Description here');
            expect(result.pricing?.amount).toBe(19.99);
            expect(result.pricing?.currency).toBe('USD');
        });
    });

    describe('Agent Configuration', () => {
        it('should create agent with default configuration', () => {
            const agent = new ScrapingAgent({
                firecrawlApiKey: 'test-key'
            });

            expect(agent).toBeDefined();
            expect(agent.isUrlSupported('https://etsy.com/listing/123456')).toBe(true);
            expect(agent.getSupportedSources()).toEqual(SCRAPING_SOURCES);
        });

        it('should track statistics correctly', () => {
            const agent = new ScrapingAgent({
                firecrawlApiKey: 'test-key'
            });

            const initialStats = agent.getStats();
            expect(initialStats.totalRequests).toBe(0);
            expect(initialStats.successfulScrapes).toBe(0);
            expect(initialStats.failedScrapes).toBe(0);

            agent.resetStats();
            const resetStats = agent.getStats();
            expect(resetStats.totalRequests).toBe(0);
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid configurations gracefully', () => {
            expect(() => {
                new ScrapingAgent({
                    firecrawlApiKey: '', // Empty API key
                    maxRetries: -1 // Invalid retry count
                });
            }).not.toThrow();
        });

        it('should validate URLs correctly', () => {
            const agent = new ScrapingAgent({
                firecrawlApiKey: 'test-key'
            });

            expect(agent.isUrlSupported('https://etsy.com/listing/123456')).toBe(true);
            expect(agent.isUrlSupported('not-a-url')).toBe(false);
            expect(agent.isUrlSupported('')).toBe(false);
        });
    });
});