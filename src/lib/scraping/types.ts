// Scraping Agent Types and Interfaces

export interface ScrapingSource {
    name: string;
    domain: string;
    categories: string[];
    endpoints: string[];
    rateLimit: number; // requests per hour
    respectRobots: boolean;
    useFirecrawl: boolean;
    selectors?: {
        title?: string;
        price?: string;
        description?: string;
        images?: string;
        seller?: string;
        features?: string;
        reviews?: string;
        rating?: string;
    };
}

export interface ScrapingRequest {
    url: string;
    source?: string;
    options?: ScrapingOptions;
    priority?: 'low' | 'normal' | 'high' | 'critical';
    userId?: string;
}

export interface ScrapingOptions {
    includeImages?: boolean;
    includeMetadata?: boolean;
    extractContent?: boolean;
    followRedirects?: boolean;
    timeout?: number;
    retries?: number;
    respectRateLimit?: boolean;
    formats?: ('markdown' | 'html' | 'text')[];
}

export interface ScrapedProduct {
    id: string;
    url: string;
    source: string;
    title: string;
    description: string;
    pricing: PricingInfo;
    features: string[];
    images: string[];
    content: string;
    metadata: ProductMetadata;
    seller?: SellerInfo;
    reviews?: ReviewInfo;
    scrapedAt: Date;
    status: 'success' | 'partial' | 'failed';
    error?: string;
}

export interface PricingInfo {
    type: 'free' | 'one-time' | 'subscription' | 'variable';
    amount?: number;
    currency?: string;
    originalPrice?: number;
    discountPercentage?: number;
    interval?: 'monthly' | 'yearly' | 'one-time';
    priceRange?: {
        min: number;
        max: number;
    };
}

export interface ProductMetadata {
    category: string;
    tags: string[];
    language: string;
    publishedDate?: Date;
    lastUpdated?: Date;
    downloadCount?: number;
    fileSize?: string;
    fileTypes?: string[];
    requirements?: string[];
    compatibility?: string[];
    license?: string;
    seoData?: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
        ogImage?: string;
    };
}

export interface SellerInfo {
    name: string;
    profileUrl?: string;
    avatar?: string;
    rating?: number;
    totalSales?: number;
    memberSince?: Date;
    verified?: boolean;
    location?: string;
}

export interface ReviewInfo {
    averageRating: number;
    totalReviews: number;
    ratingDistribution?: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
    recentReviews?: Array<{
        rating: number;
        comment: string;
        author: string;
        date: Date;
    }>;
}

export interface ScrapingResult {
    success: boolean;
    data?: ScrapedProduct;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    metadata: {
        requestId: string;
        duration: number;
        tokensUsed: number;
        cost: number;
        rateLimitRemaining: number;
        retryCount: number;
    };
}

export interface RateLimitInfo {
    source: string;
    requestsRemaining: number;
    resetTime: Date;
    requestsPerHour: number;
    currentHourRequests: number;
}

export interface ScrapingStats {
    totalRequests: number;
    successfulScrapes: number;
    failedScrapes: number;
    averageResponseTime: number;
    rateLimitHits: number;
    errorsByType: Record<string, number>;
    sourceStats: Record<string, {
        requests: number;
        successes: number;
        failures: number;
        avgResponseTime: number;
    }>;
}

// Firecrawl specific types
export interface FirecrawlResponse {
    success: boolean;
    data?: {
        markdown?: string;
        html?: string;
        metadata?: {
            title?: string;
            description?: string;
            language?: string;
            sourceURL?: string;
            [key: string]: any;
        };
        screenshot?: string;
    };
    error?: string;
}

export interface FirecrawlScrapeOptions {
    formats?: ('markdown' | 'html' | 'rawHtml' | 'screenshot')[];
    headers?: Record<string, string>;
    includeTags?: string[];
    excludeTags?: string[];
    onlyMainContent?: boolean;
    timeout?: number;
    waitFor?: number;
}