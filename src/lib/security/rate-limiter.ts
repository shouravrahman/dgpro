import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}

interface RateLimitEntry {
    count: number;
    resetTime: number;
    blocked: boolean;
}

export class EnhancedRateLimiter {
    private static store = new Map<string, RateLimitEntry>();
    private static blockedIPs = new Set<string>();

    // Default configurations for different endpoints
    private static readonly CONFIGS: Record<string, RateLimitConfig> = {
        'auth': { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
        'api': { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
        'upload': { windowMs: 60 * 1000, maxRequests: 10 }, // 10 uploads per minute
        'scraping': { windowMs: 60 * 60 * 1000, maxRequests: 50 }, // 50 scrapes per hour
        'ai': { windowMs: 60 * 1000, maxRequests: 20 }, // 20 AI requests per minute
        'admin': { windowMs: 60 * 1000, maxRequests: 200 }, // 200 admin requests per minute
        'public': { windowMs: 60 * 1000, maxRequests: 1000 }, // 1000 public requests per minute
    };

    /**
     * Check rate limit for a request
     */
    static async checkRateLimit(
        request: NextRequest,
        type: keyof typeof EnhancedRateLimiter.CONFIGS = 'api'
    ): Promise<{
        success: boolean;
        limit: number;
        remaining: number;
        reset: number;
        blocked?: boolean;
    }> {
        const identifier = this.getIdentifier(request);
        const config = this.CONFIGS[type];

        // Check if IP is blocked
        if (this.blockedIPs.has(identifier)) {
            return {
                success: false,
                limit: config.maxRequests,
                remaining: 0,
                reset: Date.now() + config.windowMs,
                blocked: true
            };
        }

        const now = Date.now();
        const key = `${type}:${identifier}`;

        // Clean expired entries
        this.cleanup();

        let entry = this.store.get(key);

        if (!entry || entry.resetTime <= now) {
            // Create new entry or reset expired one
            entry = {
                count: 1,
                resetTime: now + config.windowMs,
                blocked: false
            };
            this.store.set(key, entry);

            return {
                success: true,
                limit: config.maxRequests,
                remaining: config.maxRequests - 1,
                reset: entry.resetTime
            };
        }

        if (entry.count >= config.maxRequests) {
            // Rate limit exceeded
            entry.blocked = true;

            // Block IP if too many violations
            if (entry.count > config.maxRequests * 2) {
                this.blockedIPs.add(identifier);
                await this.logSecurityEvent('IP_BLOCKED', identifier, {
                    type,
                    count: entry.count,
                    limit: config.maxRequests
                });
            }

            return {
                success: false,
                limit: config.maxRequests,
                remaining: 0,
                reset: entry.resetTime,
                blocked: entry.blocked
            };
        }

        entry.count++;

        return {
            success: true,
            limit: config.maxRequests,
            remaining: config.maxRequests - entry.count,
            reset: entry.resetTime
        };
    }

    /**
     * Get unique identifier for rate limiting
     */
    private static getIdentifier(request: NextRequest): string {
        // Try to get real IP from headers (for production behind proxy)
        const forwarded = request.headers.get('x-forwarded-for');
        const realIP = request.headers.get('x-real-ip');
        const ip = forwarded?.split(',')[0] || realIP || request.ip || 'unknown';

        return ip;
    }

    /**
     * Clean up expired entries
     */
    private static cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (entry.resetTime <= now) {
                this.store.delete(key);
            }
        }
    }

    /**
     * Manually block an IP address
     */
    static blockIP(ip: string): void {
        this.blockedIPs.add(ip);
    }

    /**
     * Unblock an IP address
     */
    static unblockIP(ip: string): void {
        this.blockedIPs.delete(ip);
    }

    /**
     * Get blocked IPs
     */
    static getBlockedIPs(): string[] {
        return Array.from(this.blockedIPs);
    }

    /**
     * Log security events
     */
    private static async logSecurityEvent(
        event: string,
        identifier: string,
        details: any
    ): Promise<void> {
        try {
            const supabase = await createClient();
            await supabase.from('security_logs').insert({
                event_type: event,
                identifier,
                details,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to log security event:', error);
        }
    }

    /**
     * DDoS protection - detect and block suspicious patterns
     */
    static async detectDDoS(request: NextRequest): Promise<boolean> {
        const identifier = this.getIdentifier(request);
        const now = Date.now();
        const shortWindow = 10 * 1000; // 10 seconds
        const shortWindowKey = `ddos:${identifier}:${Math.floor(now / shortWindow)}`;

        let shortWindowEntry = this.store.get(shortWindowKey);
        if (!shortWindowEntry) {
            shortWindowEntry = { count: 0, resetTime: now + shortWindow, blocked: false };
            this.store.set(shortWindowKey, shortWindowEntry);
        }

        shortWindowEntry.count++;

        // If more than 50 requests in 10 seconds, it's likely DDoS
        if (shortWindowEntry.count > 50) {
            this.blockIP(identifier);
            await this.logSecurityEvent('DDOS_DETECTED', identifier, {
                requests_in_window: shortWindowEntry.count,
                window_seconds: 10
            });
            return true;
        }

        return false;
    }

    /**
     * Create rate limit middleware
     */
    static middleware(type: keyof typeof EnhancedRateLimiter.CONFIGS = 'api') {
        return async (request: NextRequest) => {
            // Check for DDoS first
            const isDDoS = await this.detectDDoS(request);
            if (isDDoS) {
                return new Response(
                    JSON.stringify({ error: 'Too many requests - DDoS protection activated' }),
                    {
                        status: 429,
                        headers: {
                            'Content-Type': 'application/json',
                            'Retry-After': '3600' // 1 hour
                        }
                    }
                );
            }

            const result = await this.checkRateLimit(request, type);

            if (!result.success) {
                const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

                return new Response(
                    JSON.stringify({
                        error: result.blocked ? 'IP blocked due to abuse' : 'Rate limit exceeded',
                        limit: result.limit,
                        remaining: result.remaining,
                        reset: result.reset
                    }),
                    {
                        status: 429,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-RateLimit-Limit': result.limit.toString(),
                            'X-RateLimit-Remaining': result.remaining.toString(),
                            'X-RateLimit-Reset': result.reset.toString(),
                            'Retry-After': retryAfter.toString()
                        }
                    }
                );
            }

            return null; // Continue to next middleware/handler
        };
    }
}