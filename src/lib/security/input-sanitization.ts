import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

// XSS Protection utilities
export class InputSanitizer {
    private static readonly HTML_ALLOWED_TAGS = [
        'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'code', 'pre', 'a', 'img'
    ];

    private static readonly HTML_ALLOWED_ATTRIBUTES = {
        'a': ['href', 'title', 'target'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        '*': ['class']
    };

    /**
     * Sanitize HTML content while preserving safe formatting
     */
    static sanitizeHTML(input: string, allowedTags?: string[]): string {
        if (!input || typeof input !== 'string') return '';

        const config = {
            ALLOWED_TAGS: allowedTags || this.HTML_ALLOWED_TAGS,
            ALLOWED_ATTR: this.HTML_ALLOWED_ATTRIBUTES,
            ALLOW_DATA_ATTR: false,
            FORBID_SCRIPT: true,
            FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
            FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'],
        };

        return DOMPurify.sanitize(input, config);
    }

    /**
     * Strip all HTML tags and return plain text
     */
    static stripHTML(input: string): string {
        if (!input || typeof input !== 'string') return '';
        return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
    }

    /**
     * Sanitize user input for database storage
     */
    static sanitizeText(input: string): string {
        if (!input || typeof input !== 'string') return '';

        return input
            .trim()
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
            .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
            .substring(0, 10000); // Limit length to prevent DoS
    }

    /**
     * Sanitize email addresses
     */
    static sanitizeEmail(email: string): string {
        if (!email || typeof email !== 'string') return '';

        return email
            .toLowerCase()
            .trim()
            .replace(/[^\w@.-]/g, '') // Keep only valid email characters
            .substring(0, 255); // RFC limit
    }

    /**
     * Sanitize URLs
     */
    static sanitizeURL(url: string): string {
        if (!url || typeof url !== 'string') return '';

        try {
            const parsed = new URL(url);

            // Only allow safe protocols
            const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
            if (!allowedProtocols.includes(parsed.protocol)) {
                return '';
            }

            return parsed.toString();
        } catch {
            return '';
        }
    }

    /**
     * Sanitize file names
     */
    static sanitizeFileName(fileName: string): string {
        if (!fileName || typeof fileName !== 'string') return '';

        return fileName
            .trim()
            .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // Remove invalid file name characters
            .replace(/^\.+/, '') // Remove leading dots
            .substring(0, 255); // Limit length
    }

    /**
     * Sanitize search queries
     */
    static sanitizeSearchQuery(query: string): string {
        if (!query || typeof query !== 'string') return '';

        return query
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML
            .replace(/[^\w\s\-_.@]/g, '') // Keep only safe characters
            .substring(0, 100); // Limit length
    }

    /**
     * Sanitize SQL-like input (for additional protection)
     */
    static sanitizeSQL(input: string): string {
        if (!input || typeof input !== 'string') return '';

        const sqlKeywords = [
            'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
            'EXEC', 'EXECUTE', 'UNION', 'SCRIPT', 'JAVASCRIPT'
        ];

        let sanitized = input.trim();

        sqlKeywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'gi');
            sanitized = sanitized.replace(regex, '');
        });

        return sanitized
            .replace(/[';-]/g, '') // Remove SQL comment and statement terminators
            .replace(/--/g, '') // Remove SQL comments
            .substring(0, 1000);
    }

    /**
     * Sanitize phone numbers
     */
    static sanitizePhoneNumber(phone: string): string {
        if (!phone || typeof phone !== 'string') return '';

        return phone
            .trim()
            .replace(/[^\d\s\-\(\)\+]/g, '') // Keep only valid phone characters
            .substring(0, 20);
    }

    /**
     * Sanitize numeric input
     */
    static sanitizeNumber(input: string | number): number | null {
        if (typeof input === 'number') {
            return isFinite(input) ? input : null;
        }

        if (typeof input !== 'string') return null;

        const cleaned = input.replace(/[^\d.-]/g, '');
        const parsed = parseFloat(cleaned);

        return isFinite(parsed) ? parsed : null;
    }

    /**
     * Sanitize boolean input
     */
    static sanitizeBoolean(input: unknown): boolean {
        if (typeof input === 'boolean') return input;
        if (typeof input === 'string') {
            return ['true', '1', 'yes', 'on'].includes(input.toLowerCase());
        }
        if (typeof input === 'number') {
            return input !== 0;
        }
        return false;
    }
}

// Rate limiting utilities
export class RateLimiter {
    private static requests = new Map<string, { count: number; resetTime: number }>();

    /**
     * Check if request is within rate limit
     */
    static checkLimit(
        identifier: string,
        maxRequests: number = 100,
        windowMs: number = 60000 // 1 minute
    ): { allowed: boolean; remaining: number; resetTime: number } {
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old entries
        for (const [key, data] of this.requests.entries()) {
            if (data.resetTime < now) {
                this.requests.delete(key);
            }
        }

        const current = this.requests.get(identifier);

        if (!current || current.resetTime < now) {
            // New window
            this.requests.set(identifier, {
                count: 1,
                resetTime: now + windowMs
            });
            return {
                allowed: true,
                remaining: maxRequests - 1,
                resetTime: now + windowMs
            };
        }

        if (current.count >= maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: current.resetTime
            };
        }

        current.count++;
        return {
            allowed: true,
            remaining: maxRequests - current.count,
            resetTime: current.resetTime
        };
    }
}

// CSRF Protection utilities
export class CSRFProtection {
    private static readonly SECRET_LENGTH = 32;

    /**
     * Generate CSRF token
     */
    static generateToken(): string {
        const array = new Uint8Array(this.SECRET_LENGTH);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Validate CSRF token
     */
    static validateToken(token: string, sessionToken: string): boolean {
        if (!token || !sessionToken || token.length !== sessionToken.length) {
            return false;
        }

        // Constant-time comparison to prevent timing attacks
        let result = 0;
        for (let i = 0; i < token.length; i++) {
            result |= token.charCodeAt(i) ^ sessionToken.charCodeAt(i);
        }

        return result === 0;
    }
}

// Content Security Policy utilities
export class CSPBuilder {
    private directives: Record<string, string[]> = {};

    addDirective(directive: string, sources: string[]): this {
        this.directives[directive] = sources;
        return this;
    }

    build(): string {
        return Object.entries(this.directives)
            .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
            .join('; ');
    }

    static getDefaultPolicy(): string {
        return new CSPBuilder()
            .addDirective('default-src', ["'self'"])
            .addDirective('script-src', ["'self'", "'unsafe-inline'", 'https://vercel.live'])
            .addDirective('style-src', ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'])
            .addDirective('font-src', ["'self'", 'https://fonts.gstatic.com'])
            .addDirective('img-src', ["'self'", 'data:', 'https:'])
            .addDirective('connect-src', ["'self'", 'https://api.vercel.com'])
            .addDirective('frame-ancestors', ["'none'"])
            .addDirective('base-uri', ["'self'"])
            .addDirective('form-action', ["'self'"])
            .build();
    }
}

// Validation middleware for API routes
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
    return (data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
        try {
            const result = schema.parse(data);
            return { success: true, data: result };
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors = error.errors.map(err =>
                    `${err.path.join('.')}: ${err.message}`
                );
                return { success: false, errors };
            }
            return { success: false, errors: ['Validation failed'] };
        }
    };
}

// File upload security
export class FileUploadSecurity {
    private static readonly ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/zip',
        'application/x-rar-compressed',
        'text/plain',
        'application/json'
    ];

    private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    static validateFile(file: File): { valid: boolean; error?: string } {
        // Check file size
        if (file.size > this.MAX_FILE_SIZE) {
            return { valid: false, error: 'File size exceeds maximum allowed size' };
        }

        // Check MIME type
        if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
            return { valid: false, error: 'File type not allowed' };
        }

        // Check file extension matches MIME type
        const extension = file.name.split('.').pop()?.toLowerCase();
        const mimeToExtension: Record<string, string[]> = {
            'image/jpeg': ['jpg', 'jpeg'],
            'image/png': ['png'],
            'image/gif': ['gif'],
            'image/webp': ['webp'],
            'application/pdf': ['pdf'],
            'application/zip': ['zip'],
            'application/x-rar-compressed': ['rar'],
            'text/plain': ['txt'],
            'application/json': ['json']
        };

        const allowedExtensions = mimeToExtension[file.type];
        if (allowedExtensions && extension && !allowedExtensions.includes(extension)) {
            return { valid: false, error: 'File extension does not match file type' };
        }

        return { valid: true };
    }

    static sanitizeFileName(fileName: string): string {
        return InputSanitizer.sanitizeFileName(fileName);
    }
}

// Export all utilities
export {
    InputSanitizer as default

};