import { RateLimitInfo } from './types';

interface RateLimitEntry {
    requests: number;
    resetTime: Date;
    lastRequest: Date;
}

export class ScrapingRateLimiter {
    private static instance: ScrapingRateLimiter;
    private limits: Map<string, RateLimitEntry> = new Map();
    private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

    private constructor() {
        // Clean up expired entries periodically
        setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
    }

    public static getInstance(): ScrapingRateLimiter {
        if (!ScrapingRateLimiter.instance) {
            ScrapingRateLimiter.instance = new ScrapingRateLimiter();
        }
        return ScrapingRateLimiter.instance;
    }

    /**
     * Check if a request is allowed for the given source
     */
    public async checkRateLimit(source: string, maxRequestsPerHour: number): Promise<{
        allowed: boolean;
        rateLimitInfo: RateLimitInfo;
        waitTime?: number;
    }> {
        const now = new Date();
        const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        let entry = this.limits.get(source);

        // Initialize or reset if hour has passed
        if (!entry || entry.resetTime <= now) {
            entry = {
                requests: 0,
                resetTime: new Date(now.getTime() + 60 * 60 * 1000), // Next hour
                lastRequest: now
            };
            this.limits.set(source, entry);
        }

        const requestsRemaining = Math.max(0, maxRequestsPerHour - entry.requests);
        const allowed = entry.requests < maxRequestsPerHour;

        const rateLimitInfo: RateLimitInfo = {
            source,
            requestsRemaining,
            resetTime: entry.resetTime,
            requestsPerHour: maxRequestsPerHour,
            currentHourRequests: entry.requests
        };

        let waitTime: number | undefined;
        if (!allowed) {
            // Calculate wait time until rate limit resets
            waitTime = entry.resetTime.getTime() - now.getTime();
        }

        return {
            allowed,
            rateLimitInfo,
            waitTime
        };
    }

    /**
     * Record a request for the given source
     */
    public recordRequest(source: string): void {
        const entry = this.limits.get(source);
        if (entry) {
            entry.requests++;
            entry.lastRequest = new Date();
        }
    }

    /**
     * Get current rate limit info for a source
     */
    public getRateLimitInfo(source: string, maxRequestsPerHour: number): RateLimitInfo {
        const entry = this.limits.get(source);
        const now = new Date();

        if (!entry || entry.resetTime <= now) {
            return {
                source,
                requestsRemaining: maxRequestsPerHour,
                resetTime: new Date(now.getTime() + 60 * 60 * 1000),
                requestsPerHour: maxRequestsPerHour,
                currentHourRequests: 0
            };
        }

        return {
            source,
            requestsRemaining: Math.max(0, maxRequestsPerHour - entry.requests),
            resetTime: entry.resetTime,
            requestsPerHour: maxRequestsPerHour,
            currentHourRequests: entry.requests
        };
    }

    /**
     * Reset rate limit for a source (useful for testing or manual reset)
     */
    public resetRateLimit(source: string): void {
        this.limits.delete(source);
    }

    /**
     * Get all current rate limits
     */
    public getAllRateLimits(): Map<string, RateLimitEntry> {
        return new Map(this.limits);
    }

    /**
     * Clean up expired entries
     */
    private cleanup(): void {
        const now = new Date();
        for (const [source, entry] of this.limits.entries()) {
            if (entry.resetTime <= now) {
                this.limits.delete(source);
            }
        }
    }

    /**
     * Calculate optimal delay between requests to respect rate limits
     */
    public calculateOptimalDelay(source: string, maxRequestsPerHour: number): number {
        const entry = this.limits.get(source);
        if (!entry) return 0;

        // Calculate minimum delay to stay within rate limits
        const minDelayMs = (60 * 60 * 1000) / maxRequestsPerHour; // Spread requests evenly over the hour

        // Add some jitter to avoid thundering herd
        const jitter = Math.random() * 1000; // 0-1 second jitter

        return Math.max(0, minDelayMs + jitter);
    }

    /**
     * Wait for rate limit to allow next request
     */
    public async waitForRateLimit(source: string, maxRequestsPerHour: number): Promise<void> {
        const { allowed, waitTime } = await this.checkRateLimit(source, maxRequestsPerHour);

        if (!allowed && waitTime) {
            // If wait time is too long, throw an error instead of waiting
            if (waitTime > 5 * 60 * 1000) { // 5 minutes
                throw new Error(`Rate limit exceeded for ${source}. Reset in ${Math.ceil(waitTime / 60000)} minutes.`);
            }

            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    /**
     * Batch rate limit check for multiple sources
     */
    public async checkMultipleRateLimits(
        requests: Array<{ source: string; maxRequestsPerHour: number }>
    ): Promise<Array<{ source: string; allowed: boolean; rateLimitInfo: RateLimitInfo }>> {
        const results = [];

        for (const request of requests) {
            const { allowed, rateLimitInfo } = await this.checkRateLimit(
                request.source,
                request.maxRequestsPerHour
            );

            results.push({
                source: request.source,
                allowed,
                rateLimitInfo
            });
        }

        return results;
    }
}