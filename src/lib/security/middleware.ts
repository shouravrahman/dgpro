import { NextRequest, NextResponse } from 'next/server';
import { EnhancedRateLimiter } from './rate-limiter';
import { InputSanitizer, CSPBuilder } from './input-sanitization';
import { securityMonitoring } from './monitoring';
import { auditLogger } from './audit-logger';

export interface SecurityConfig {
    enableRateLimit?: boolean;
    enableCSP?: boolean;
    enableSecurityHeaders?: boolean;
    enableInputSanitization?: boolean;
    enableAuditLogging?: boolean;
    rateLimitType?: 'api' | 'auth' | 'upload' | 'scraping' | 'ai' | 'admin' | 'public';
    customCSP?: string;
}

export class SecurityMiddleware {
    /**
     * Comprehensive security middleware
     */
    static async apply(
        request: NextRequest,
        config: SecurityConfig = {}
    ): Promise<NextResponse | null> {
        const startTime = Date.now();

        try {
            // Default configuration
            const {
                enableRateLimit = true,
                enableCSP = true,
                enableSecurityHeaders = true,
                enableInputSanitization = true,
                enableAuditLogging = true,
                rateLimitType = 'api',
                customCSP
            } = config;

            // 1. Rate Limiting & DDoS Protection
            if (enableRateLimit) {
                const rateLimitResult = await EnhancedRateLimiter.checkRateLimit(request, rateLimitType);

                if (!rateLimitResult.success) {
                    const response = NextResponse.json(
                        {
                            error: rateLimitResult.blocked ? 'IP blocked due to abuse' : 'Rate limit exceeded',
                            limit: rateLimitResult.limit,
                            remaining: rateLimitResult.remaining,
                            reset: rateLimitResult.reset
                        },
                        { status: 429 }
                    );

                    this.addSecurityHeaders(response, customCSP);
                    return response;
                }
            }

            // 2. Input Sanitization for query parameters and headers
            if (enableInputSanitization) {
                const sanitizationResult = this.sanitizeRequest(request);
                if (!sanitizationResult.valid) {
                    const response = NextResponse.json(
                        { error: 'Invalid input detected', details: sanitizationResult.errors },
                        { status: 400 }
                    );

                    this.addSecurityHeaders(response, customCSP);

                    // Log security event
                    await auditLogger.logSecurityEvent('INPUT_VALIDATION_FAILED',
                        this.getClientIP(request), {
                        errors: sanitizationResult.errors,
                        url: request.url,
                        method: request.method
                    }, 'medium');

                    return response;
                }
            }

            // 3. Security monitoring
            await securityMonitoring.monitorAPIUsage(
                request.nextUrl.pathname,
                request.method,
                null, // User ID would be extracted from auth
                request,
                Date.now() - startTime,
                200 // Assuming success at this point
            );

            // 4. Audit logging
            if (enableAuditLogging) {
                await auditLogger.logAPIUsage(
                    request.nextUrl.pathname,
                    request.method,
                    null, // User ID would be extracted from auth
                    request,
                    200,
                    Date.now() - startTime
                );
            }

            // Continue to next middleware/handler
            return null;

        } catch (error) {
            console.error('Security middleware error:', error);

            // Log security error
            await auditLogger.logSecurityEvent('SECURITY_MIDDLEWARE_ERROR',
                this.getClientIP(request), {
                error: error instanceof Error ? error.message : 'Unknown error',
                url: request.url,
                method: request.method
            }, 'high');

            // Return error response with security headers
            const response = NextResponse.json(
                { error: 'Security check failed' },
                { status: 500 }
            );

            this.addSecurityHeaders(response, config.customCSP);
            return response;
        }
    }

    /**
     * Add comprehensive security headers
     */
    static addSecurityHeaders(response: NextResponse, customCSP?: string): void {
        // Content Security Policy
        const csp = customCSP || CSPBuilder.getDefaultPolicy();
        response.headers.set('Content-Security-Policy', csp);

        // Security headers
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        // HSTS (HTTP Strict Transport Security)
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

        // Remove server information
        response.headers.delete('Server');
        response.headers.delete('X-Powered-By');

        // CORS headers for API routes
        response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || 'https://yourdomain.com');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        response.headers.set('Access-Control-Max-Age', '86400');
    }

    /**
     * Sanitize request inputs
     */
    static sanitizeRequest(request: NextRequest): { valid: boolean; errors?: string[] } {
        const errors: string[] = [];

        try {
            // Check URL for suspicious patterns
            const url = request.url;
            const suspiciousPatterns = [
                /<script/i,
                /javascript:/i,
                /vbscript:/i,
                /onload=/i,
                /onerror=/i,
                /'.*OR.*'.*=/i, // SQL injection patterns
                /UNION.*SELECT/i,
                /DROP.*TABLE/i,
                /INSERT.*INTO/i,
                /UPDATE.*SET/i,
                /DELETE.*FROM/i
            ];

            for (const pattern of suspiciousPatterns) {
                if (pattern.test(url)) {
                    errors.push(`Suspicious pattern detected in URL: ${pattern.source}`);
                }
            }

            // Check query parameters
            const searchParams = request.nextUrl.searchParams;
            for (const [key, value] of searchParams.entries()) {
                const sanitizedKey = InputSanitizer.sanitizeText(key);
                const sanitizedValue = InputSanitizer.sanitizeText(value);

                if (sanitizedKey !== key) {
                    errors.push(`Invalid characters in query parameter key: ${key}`);
                }

                if (sanitizedValue !== value) {
                    errors.push(`Invalid characters in query parameter value: ${key}=${value}`);
                }

                // Check for excessively long parameters
                if (value.length > 1000) {
                    errors.push(`Query parameter too long: ${key}`);
                }
            }

            // Check headers for suspicious content
            const suspiciousHeaders = ['x-forwarded-for', 'user-agent', 'referer'];
            for (const headerName of suspiciousHeaders) {
                const headerValue = request.headers.get(headerName);
                if (headerValue) {
                    for (const pattern of suspiciousPatterns) {
                        if (pattern.test(headerValue)) {
                            errors.push(`Suspicious pattern in header ${headerName}: ${pattern.source}`);
                        }
                    }
                }
            }

            // Check for suspicious user agents
            const userAgent = request.headers.get('user-agent');
            if (userAgent) {
                const suspiciousUserAgents = [
                    /bot/i,
                    /crawler/i,
                    /spider/i,
                    /scraper/i,
                    /curl/i,
                    /wget/i,
                    /python/i,
                    /java/i
                ];

                // Allow legitimate bots but flag suspicious ones
                const legitimateBots = [
                    /googlebot/i,
                    /bingbot/i,
                    /slurp/i,
                    /duckduckbot/i,
                    /baiduspider/i,
                    /yandexbot/i,
                    /facebookexternalhit/i,
                    /twitterbot/i,
                    /linkedinbot/i
                ];

                const isSuspicious = suspiciousUserAgents.some(pattern => pattern.test(userAgent));
                const isLegitimate = legitimateBots.some(pattern => pattern.test(userAgent));

                if (isSuspicious && !isLegitimate) {
                    errors.push(`Suspicious user agent: ${userAgent}`);
                }
            }

            return {
                valid: errors.length === 0,
                errors: errors.length > 0 ? errors : undefined
            };

        } catch (error) {
            console.error('Request sanitization error:', error);
            return {
                valid: false,
                errors: ['Request sanitization failed']
            };
        }
    }

    /**
     * Validate request body for API routes
     */
    static async validateRequestBody(request: NextRequest): Promise<{ valid: boolean; sanitizedBody?: any; errors?: string[] }> {
        try {
            const contentType = request.headers.get('content-type');

            if (!contentType) {
                return { valid: true }; // No body to validate
            }

            if (contentType.includes('application/json')) {
                const body = await request.json();
                const sanitizedBody = this.sanitizeObject(body);

                return {
                    valid: true,
                    sanitizedBody
                };
            }

            if (contentType.includes('multipart/form-data')) {
                const formData = await request.formData();
                const sanitizedData = new FormData();

                for (const [key, value] of formData.entries()) {
                    if (typeof value === 'string') {
                        sanitizedData.append(
                            InputSanitizer.sanitizeText(key),
                            InputSanitizer.sanitizeText(value)
                        );
                    } else {
                        // File upload - validate file
                        const file = value as File;
                        const validation = this.validateFile(file);

                        if (!validation.valid) {
                            return {
                                valid: false,
                                errors: validation.errors
                            };
                        }

                        sanitizedData.append(key, file);
                    }
                }

                return {
                    valid: true,
                    sanitizedBody: sanitizedData
                };
            }

            return { valid: true };

        } catch (error) {
            console.error('Request body validation error:', error);
            return {
                valid: false,
                errors: ['Request body validation failed']
            };
        }
    }

    /**
     * Sanitize object recursively
     */
    static sanitizeObject(obj: any): any {
        if (obj === null || obj === undefined) {
            return obj;
        }

        if (typeof obj === 'string') {
            return InputSanitizer.sanitizeText(obj);
        }

        if (typeof obj === 'number' || typeof obj === 'boolean') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        }

        if (typeof obj === 'object') {
            const sanitized: any = {};
            for (const [key, value] of Object.entries(obj)) {
                const sanitizedKey = InputSanitizer.sanitizeText(key);
                sanitized[sanitizedKey] = this.sanitizeObject(value);
            }
            return sanitized;
        }

        return obj;
    }

    /**
     * Validate uploaded files
     */
    static validateFile(file: File): { valid: boolean; errors?: string[] } {
        const errors: string[] = [];

        // Check file size (50MB limit)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            errors.push(`File too large: ${file.size} bytes (max: ${maxSize})`);
        }

        // Check file type
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain', 'application/json',
            'application/zip', 'application/x-rar-compressed'
        ];

        if (!allowedTypes.includes(file.type)) {
            errors.push(`File type not allowed: ${file.type}`);
        }

        // Check file name
        const sanitizedName = InputSanitizer.sanitizeFileName(file.name);
        if (sanitizedName !== file.name) {
            errors.push(`Invalid characters in file name: ${file.name}`);
        }

        return {
            valid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }

    /**
     * Get client IP address
     */
    static getClientIP(request: NextRequest): string {
        const forwarded = request.headers.get('x-forwarded-for');
        const realIP = request.headers.get('x-real-ip');
        return forwarded?.split(',')[0] || realIP || request.ip || 'unknown';
    }

    /**
     * Create middleware for specific route types
     */
    static createMiddleware(config: SecurityConfig = {}) {
        return async (request: NextRequest) => {
            return await this.apply(request, config);
        };
    }

    /**
     * API route security wrapper
     */
    static secureAPIRoute(handler: (request: NextRequest) => Promise<NextResponse>, config: SecurityConfig = {}) {
        return async (request: NextRequest) => {
            // Apply security middleware
            const securityResult = await this.apply(request, config);
            if (securityResult) {
                return securityResult; // Security check failed
            }

            // Call the actual handler
            const response = await handler(request);

            // Add security headers to response
            this.addSecurityHeaders(response, config.customCSP);

            return response;
        };
    }
}

// Export convenience functions
export const secureAPI = SecurityMiddleware.secureAPIRoute;
export const createSecurityMiddleware = SecurityMiddleware.createMiddleware;