import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ScrapingRateLimiter } from '../rate-limiter';

describe('ScrapingRateLimiter', () => {
    let rateLimiter: ScrapingRateLimiter;

    beforeEach(() => {
        // Get fresh instance for each test
        rateLimiter = ScrapingRateLimiter.getInstance();

        // Clear any existing limits
        const allLimits = rateLimiter.getAllRateLimits();
        for (const source of allLimits.keys()) {
            rateLimiter.resetRateLimit(source);
        }
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('checkRateLimit', () => {
        it('should allow requests within rate limit', async () => {
            const source = 'test-source';
            const maxRequests = 10;

            const result = await rateLimiter.checkRateLimit(source, maxRequests);

            expect(result.allowed).toBe(true);
            expect(result.rateLimitInfo.requestsRemaining).toBe(maxRequests);
            expect(result.rateLimitInfo.currentHourRequests).toBe(0);
            expect(result.waitTime).toBeUndefined();
        });

        it('should track requests correctly', async () => {
            const source = 'test-source';
            const maxRequests = 5;

            // Make 3 requests
            for (let i = 0; i < 3; i++) {
                const result = await rateLimiter.checkRateLimit(source, maxRequests);
                expect(result.allowed).toBe(true);
                rateLimiter.recordRequest(source);
            }

            // Check remaining requests
            const result = await rateLimiter.checkRateLimit(source, maxRequests);
            expect(result.allowed).toBe(true);
            expect(result.rateLimitInfo.requestsRemaining).toBe(2);
            expect(result.rateLimitInfo.currentHourRequests).toBe(3);
        });

        it('should block requests when rate limit exceeded', async () => {
            const source = 'test-source';
            const maxRequests = 2;

            // Use up the rate limit
            for (let i = 0; i < maxRequests; i++) {
                await rateLimiter.checkRateLimit(source, maxRequests);
                rateLimiter.recordRequest(source);
            }

            // Next request should be blocked
            const result = await rateLimiter.checkRateLimit(source, maxRequests);
            expect(result.allowed).toBe(false);
            expect(result.rateLimitInfo.requestsRemaining).toBe(0);
            expect(result.waitTime).toBeGreaterThan(0);
        });

        it('should reset rate limit after an hour', async () => {
            const source = 'test-source';
            const maxRequests = 1;

            // Use up the rate limit
            await rateLimiter.checkRateLimit(source, maxRequests);
            rateLimiter.recordRequest(source);

            // Should be blocked
            let result = await rateLimiter.checkRateLimit(source, maxRequests);
            expect(result.allowed).toBe(false);

            // Mock time passing (simulate hour passing)
            const futureTime = Date.now() + 61 * 60 * 1000; // 61 minutes later
            vi.useFakeTimers();
            vi.setSystemTime(futureTime);

            // Should be allowed again
            result = await rateLimiter.checkRateLimit(source, maxRequests);
            expect(result.allowed).toBe(true);
            expect(result.rateLimitInfo.currentHourRequests).toBe(0);

            // Restore real timers
            vi.useRealTimers();
        });
    });

    describe('recordRequest', () => {
        it('should increment request count', async () => {
            const source = 'test-source';
            const maxRequests = 10;

            // Initial state
            let result = await rateLimiter.checkRateLimit(source, maxRequests);
            expect(result.rateLimitInfo.currentHourRequests).toBe(0);

            // Record a request
            rateLimiter.recordRequest(source);

            // Check updated state
            result = await rateLimiter.checkRateLimit(source, maxRequests);
            expect(result.rateLimitInfo.currentHourRequests).toBe(1);
            expect(result.rateLimitInfo.requestsRemaining).toBe(9);
        });
    });

    describe('getRateLimitInfo', () => {
        it('should return current rate limit info', () => {
            const source = 'test-source';
            const maxRequests = 100;

            const info = rateLimiter.getRateLimitInfo(source, maxRequests);

            expect(info.source).toBe(source);
            expect(info.requestsPerHour).toBe(maxRequests);
            expect(info.requestsRemaining).toBe(maxRequests);
            expect(info.currentHourRequests).toBe(0);
            expect(info.resetTime).toBeInstanceOf(Date);
        });

        it('should return updated info after requests', async () => {
            const source = 'test-source';
            const maxRequests = 50;

            // Make some requests
            await rateLimiter.checkRateLimit(source, maxRequests);
            rateLimiter.recordRequest(source);
            rateLimiter.recordRequest(source);

            const info = rateLimiter.getRateLimitInfo(source, maxRequests);

            expect(info.currentHourRequests).toBe(2);
            expect(info.requestsRemaining).toBe(48);
        });
    });

    describe('resetRateLimit', () => {
        it('should reset rate limit for a source', async () => {
            const source = 'test-source';
            const maxRequests = 5;

            // Use up some requests
            for (let i = 0; i < 3; i++) {
                await rateLimiter.checkRateLimit(source, maxRequests);
                rateLimiter.recordRequest(source);
            }

            // Verify requests were recorded
            let result = await rateLimiter.checkRateLimit(source, maxRequests);
            expect(result.rateLimitInfo.currentHourRequests).toBe(3);

            // Reset rate limit
            rateLimiter.resetRateLimit(source);

            // Verify reset
            result = await rateLimiter.checkRateLimit(source, maxRequests);
            expect(result.rateLimitInfo.currentHourRequests).toBe(0);
            expect(result.rateLimitInfo.requestsRemaining).toBe(maxRequests);
        });
    });

    describe('calculateOptimalDelay', () => {
        it('should calculate delay to spread requests evenly', () => {
            const source = 'test-source';
            const maxRequests = 60; // 60 requests per hour = 1 per minute

            const delay = rateLimiter.calculateOptimalDelay(source, maxRequests);

            // Should be around 60 seconds (60000ms) plus jitter
            expect(delay).toBeGreaterThan(60000);
            expect(delay).toBeLessThan(61000); // 60s + 1s jitter
        });

        it('should return 0 delay for new source', () => {
            const source = 'new-source';
            const maxRequests = 100;

            const delay = rateLimiter.calculateOptimalDelay(source, maxRequests);

            // Should be minimal delay for new source
            expect(delay).toBeGreaterThanOrEqual(0);
            expect(delay).toBeLessThan(37000); // (3600000ms / 100) + 1000ms jitter
        });
    });

    describe('waitForRateLimit', () => {
        it('should not wait when requests are allowed', async () => {
            const source = 'test-source';
            const maxRequests = 10;

            const startTime = Date.now();
            await rateLimiter.waitForRateLimit(source, maxRequests);
            const endTime = Date.now();

            // Should complete almost immediately
            expect(endTime - startTime).toBeLessThan(100);
        });

        it('should throw error for long wait times', async () => {
            const source = 'test-source';
            const maxRequests = 1;

            // Use up the rate limit
            await rateLimiter.checkRateLimit(source, maxRequests);
            rateLimiter.recordRequest(source);

            // Should throw error instead of waiting
            await expect(rateLimiter.waitForRateLimit(source, maxRequests))
                .rejects.toThrow('Rate limit exceeded');
        });
    });

    describe('checkMultipleRateLimits', () => {
        it('should check multiple sources at once', async () => {
            const requests = [
                { source: 'source1', maxRequestsPerHour: 100 },
                { source: 'source2', maxRequestsPerHour: 50 },
                { source: 'source3', maxRequestsPerHour: 200 }
            ];

            const results = await rateLimiter.checkMultipleRateLimits(requests);

            expect(results).toHaveLength(3);
            expect(results[0].source).toBe('source1');
            expect(results[0].allowed).toBe(true);
            expect(results[0].rateLimitInfo.requestsRemaining).toBe(100);

            expect(results[1].source).toBe('source2');
            expect(results[1].allowed).toBe(true);
            expect(results[1].rateLimitInfo.requestsRemaining).toBe(50);

            expect(results[2].source).toBe('source3');
            expect(results[2].allowed).toBe(true);
            expect(results[2].rateLimitInfo.requestsRemaining).toBe(200);
        });

        it('should handle mixed allowed/blocked sources', async () => {
            const source1 = 'source1';
            const source2 = 'source2';

            // Use up rate limit for source1
            await rateLimiter.checkRateLimit(source1, 1);
            rateLimiter.recordRequest(source1);

            const requests = [
                { source: source1, maxRequestsPerHour: 1 },
                { source: source2, maxRequestsPerHour: 10 }
            ];

            const results = await rateLimiter.checkMultipleRateLimits(requests);

            expect(results[0].allowed).toBe(false); // source1 blocked
            expect(results[1].allowed).toBe(true);  // source2 allowed
        });
    });

    describe('singleton behavior', () => {
        it('should return the same instance', () => {
            const instance1 = ScrapingRateLimiter.getInstance();
            const instance2 = ScrapingRateLimiter.getInstance();

            expect(instance1).toBe(instance2);
        });

        it('should maintain state across getInstance calls', async () => {
            const instance1 = ScrapingRateLimiter.getInstance();

            // Make a request with instance1
            await instance1.checkRateLimit('test', 10);
            instance1.recordRequest('test');

            const instance2 = ScrapingRateLimiter.getInstance();
            const result = await instance2.checkRateLimit('test', 10);

            // Should see the request made by instance1
            expect(result.rateLimitInfo.currentHourRequests).toBe(1);
        });
    });
});