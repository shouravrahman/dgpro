// Scraping Agent Module Exports

import { ScrapedProduct } from './types';

// Main agent
export { ScrapingAgent } from './scraping-agent';
export type { ScrapingAgentConfig } from './scraping-agent';

// Types and interfaces
export type {
    ScrapingSource,
    ScrapingRequest,
    ScrapingOptions,
    ScrapedProduct,
    PricingInfo,
    ProductMetadata,
    SellerInfo,
    ReviewInfo,
    ScrapingResult,
    RateLimitInfo,
    ScrapingStats,
    FirecrawlResponse,
    FirecrawlScrapeOptions
} from './types';

// Sources configuration
export {
    SCRAPING_SOURCES,
    SOURCE_CATEGORIES,
    getSourceByDomain,
    getSourcesByCategory,
    isSupportedUrl,
    getRateLimit
} from './sources';

// Rate limiting
export { ScrapingRateLimiter } from './rate-limiter';

// Content extraction
export { ContentExtractor } from './content-extractor';

// Facebook Ads Intelligence
export { FacebookAdsIntelligence } from './facebook-ads-intelligence';
export type { FacebookAdData, AdIntelligenceReport } from './facebook-ads-intelligence';

// Winning Products Analyzer
export { WinningProductsAnalyzer } from './winning-products-analyzer';
export type {
    WinningProduct,
    MarketAnalysis,
    AnalysisConfig
} from './winning-products-analyzer';

// Utility functions
export const ScrapingUtils = {
    /**
     * Validate if a URL is scrapable
     */
    isValidScrapingUrl: (url: string): boolean => {
        try {
            const urlObj = new URL(url);
            return ['http:', 'https:'].includes(urlObj.protocol);
        } catch {
            return false;
        }
    },

    /**
     * Extract domain from URL
     */
    extractDomain: (url: string): string | null => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return null;
        }
    },

    /**
     * Generate scraping request ID
     */
    generateRequestId: (): string => {
        return `scrape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Calculate estimated scraping time based on source
     */
    estimateScrapingTime: (source: string): number => {
        const baseTimes: Record<string, number> = {
            'etsy': 5000,
            'gumroad': 3000,
            'udemy': 8000,
            'skillshare': 6000,
            'producthunt': 4000,
            'default': 5000
        };

        return baseTimes[source.toLowerCase()] || baseTimes.default;
    },

    /**
     * Format scraping error for user display
     */
    formatScrapingError: (error: unknown): string => {
        if (typeof error === 'string') return error;

        const errorMessages: Record<string, string> = {
            'RATE_LIMIT_EXCEEDED': 'Too many requests. Please try again later.',
            'INVALID_URL': 'The provided URL is not valid.',
            'UNSUPPORTED_DOMAIN': 'This website is not supported for scraping.',
            'TIMEOUT': 'The request timed out. Please try again.',
            'NETWORK_ERROR': 'Network error occurred. Please check your connection.',
            'FIRECRAWL_ERROR': 'Scraping service is temporarily unavailable.'
        };

        return errorMessages[error.code] || error.message || 'An unexpected error occurred.';
    },

    /**
     * Sanitize scraped content
     */
    sanitizeContent: (content: string): string => {
        return content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    },

    /**
     * Extract price from text
     */
    extractPriceFromText: (text: string): { amount: number; currency: string } | null => {
        const pricePatterns = [
            /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/,
            /€(\d+(?:,\d{3})*(?:\.\d{2})?)/,
            /£(\d+(?:,\d{3})*(?:\.\d{2})?)/,
            /¥(\d+(?:,\d{3})*)/
        ];

        const currencies = ['USD', 'EUR', 'GBP', 'JPY'];

        for (let i = 0; i < pricePatterns.length; i++) {
            const match = text.match(pricePatterns[i]);
            if (match) {
                return {
                    amount: parseFloat(match[1].replace(',', '')),
                    currency: currencies[i]
                };
            }
        }

        return null;
    },

    /**
     * Validate scraped product data
     */
    validateScrapedProduct: (product: Partial<ScrapedProduct>): string[] => {
        const errors: string[] = [];

        if (!product.title || product.title.trim().length === 0) {
            errors.push('Product title is required');
        }

        if (!product.url || !ScrapingUtils.isValidScrapingUrl(product.url)) {
            errors.push('Valid product URL is required');
        }

        if (!product.source || product.source.trim().length === 0) {
            errors.push('Product source is required');
        }

        if (product.pricing && product.pricing.type === 'one-time' && !product.pricing.amount) {
            errors.push('Price amount is required for paid products');
        }

        return errors;
    }
};

// Default scraping configuration
export const DEFAULT_SCRAPING_CONFIG = {
    timeout: 30000,
    retries: 3,
    respectRateLimit: true,
    includeImages: true,
    includeMetadata: true,
    extractContent: false,
    formats: ['markdown', 'html'] as const,
    concurrency: 3,
    batchSize: 10
};

// Error codes
export const SCRAPING_ERROR_CODES = {
    INVALID_URL: 'INVALID_URL',
    UNSUPPORTED_DOMAIN: 'UNSUPPORTED_DOMAIN',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    TIMEOUT: 'TIMEOUT',
    NETWORK_ERROR: 'NETWORK_ERROR',
    FIRECRAWL_ERROR: 'FIRECRAWL_ERROR',
    CONTENT_EXTRACTION_FAILED: 'CONTENT_EXTRACTION_FAILED',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

export type ScrapingErrorCode = typeof SCRAPING_ERROR_CODES[keyof typeof SCRAPING_ERROR_CODES];