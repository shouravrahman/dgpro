// Simple in-memory rate limiter for development
// In production, use Redis or a proper rate limiting service

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

export function rateLimit(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000 // 1 minute
): RateLimitResult {
    const now = Date.now();
    const key = identifier;

    // Clean up expired entries
    for (const [k, v] of rateLimitStore.entries()) {
        if (v.resetTime <= now) {
            rateLimitStore.delete(k);
        }
    }

    const entry = rateLimitStore.get(key);

    if (!entry) {
        // First request
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + windowMs,
        });

        return {
            success: true,
            limit,
            remaining: limit - 1,
            reset: now + windowMs,
        };
    }

    if (entry.resetTime <= now) {
        // Window has expired, reset
        entry.count = 1;
        entry.resetTime = now + windowMs;

        return {
            success: true,
            limit,
            remaining: limit - 1,
            reset: entry.resetTime,
        };
    }

    if (entry.count >= limit) {
        // Rate limit exceeded
        return {
            success: false,
            limit,
            remaining: 0,
            reset: entry.resetTime,
        };
    }

    // Increment count
    entry.count++;

    return {
        success: true,
        limit,
        remaining: limit - entry.count,
        reset: entry.resetTime,
    };
}