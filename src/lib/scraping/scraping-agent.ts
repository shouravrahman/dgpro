import FirecrawlApp from '@mendable/firecrawl-js';
import { EnhancedBaseAgent, EnhancedAgentConfig } from '../ai/enhanced-base-agent';
import { AgentRequest } from '../ai/types';
import {
    ScrapingRequest,
    ScrapingResult,
    ScrapedProduct,
    ScrapingStats,
    FirecrawlScrapeOptions
} from './types';
import { SCRAPING_SOURCES, getSourceByDomain, getRateLimit } from './sources';
import { ScrapingRateLimiter } from './rate-limiter';
import { ContentExtractor } from './content-extractor';

export interface ScrapingAgentConfig extends EnhancedAgentConfig {
    firecrawlApiKey?: string;
    defaultTimeout?: number;
    maxRetries?: number;
    respectRateLimit?: boolean;
}

export class ScrapingAgent extends EnhancedBaseAgent {
    private firecrawl: FirecrawlApp;
    private rateLimiter: ScrapingRateLimiter;
    private contentExtractor: ContentExtractor;
    private stats: ScrapingStats;

    constructor(config: ScrapingAgentConfig) {
        const agentConfig: EnhancedAgentConfig = {
            id: 'scraping-agent',
            name: 'Product Scraping Agent',
            description: 'AI agent specialized in scraping and analyzing digital products from various marketplaces',
            primaryModel: 'gemini-1.5-flash',
            fallbackModels: ['gemini-1.5-pro'],
            maxRetries: config.maxRetries || 3,
            timeout: config.defaultTimeout || 30000,
            cacheEnabled: true,
            cacheTTL: 1800, // 30 minutes
            rateLimitPerMinute: 30,
            enableStreaming: false,
            enableQueue: true,
            ...config
        };

        super(agentConfig);

        // Initialize Firecrawl
        this.firecrawl = new FirecrawlApp({
            apiKey: config.firecrawlApiKey || process.env.FIRECRAWL_API_KEY!
        });

        // Initialize components
        this.rateLimiter = ScrapingRateLimiter.getInstance();
        this.contentExtractor = new ContentExtractor();

        // Initialize stats
        this.stats = {
            totalRequests: 0,
            successfulScrapes: 0,
            failedScrapes: 0,
            averageResponseTime: 0,
            rateLimitHits: 0,
            errorsByType: {},
            sourceStats: {}
        };
    }

    /**
     * Main scraping method
     */
    public async scrapeProduct(request: ScrapingRequest): Promise<ScrapingResult> {
        const startTime = Date.now();
        const requestId = this.generateRequestId();

        this.stats.totalRequests++;

        try {
            // Validate URL
            if (!this.isValidUrl(request.url)) {
                throw new Error('Invalid URL provided');
            }

            // Get source configuration
            const source = getSourceByDomain(request.url);
            if (!source) {
                throw new Error(`Unsupported domain: ${new URL(request.url).hostname}`);
            }

            // Check rate limits
            if (request.options?.respectRateLimit !== false) {
                await this.checkAndWaitForRateLimit(source.name, source.rateLimit);
            }

            // Perform scraping
            const scrapingResult = await this.performScraping(request, source);

            // Record successful request
            this.rateLimiter.recordRequest(source.name);
            this.updateSourceStats(source.name, true, Date.now() - startTime);
            this.stats.successfulScrapes++;

            const duration = Date.now() - startTime;
            this.updateAverageResponseTime(duration);

            return {
                success: true,
                data: scrapingResult,
                metadata: {
                    requestId,
                    duration,
                    tokensUsed: 0, // Updated by AI analysis if needed
                    cost: 0,
                    rateLimitRemaining: this.rateLimiter.getRateLimitInfo(source.name, source.rateLimit).requestsRemaining,
                    retryCount: 0
                }
            };

        } catch (error) {
            this.stats.failedScrapes++;
            const errorMessage = (error as Error).message;
            this.stats.errorsByType[errorMessage] = (this.stats.errorsByType[errorMessage] || 0) + 1;

            const source = getSourceByDomain(request.url);
            if (source) {
                this.updateSourceStats(source.name, false, Date.now() - startTime);
            }

            return {
                success: false,
                error: {
                    code: 'SCRAPING_FAILED',
                    message: errorMessage,
                    details: error
                },
                metadata: {
                    requestId,
                    duration: Date.now() - startTime,
                    tokensUsed: 0,
                    cost: 0,
                    rateLimitRemaining: source ? this.rateLimiter.getRateLimitInfo(source.name, source.rateLimit).requestsRemaining : 0,
                    retryCount: 0
                }
            };
        }
    }

    /**
     * Perform the actual scraping using Firecrawl
     */
    private async performScraping(request: ScrapingRequest, source: any): Promise<ScrapedProduct> {
        const options: FirecrawlScrapeOptions = {
            formats: request.options?.formats || ['markdown', 'html'],
            onlyMainContent: true,
            timeout: request.options?.timeout || 30000,
            waitFor: 2000, // Wait 2 seconds for dynamic content
            ...this.getSourceSpecificOptions(source)
        };

        // Scrape with Firecrawl
        const firecrawlResult = await this.firecrawl.scrapeUrl(request.url, options);

        if (!firecrawlResult.success || !firecrawlResult.data) {
            throw new Error(`Firecrawl scraping failed: ${firecrawlResult.error || 'Unknown error'}`);
        }

        // Extract structured data
        const extractedData = this.contentExtractor.extractProductData(
            firecrawlResult.data.html || '',
            firecrawlResult.data.markdown || '',
            request.url,
            source,
            firecrawlResult.data.metadata
        );

        // Create scraped product
        const scrapedProduct: ScrapedProduct = {
            id: this.generateProductId(),
            url: request.url,
            source: source.name,
            title: extractedData.title || 'Untitled Product',
            description: extractedData.description || 'No description available',
            pricing: extractedData.pricing || { type: 'free' },
            features: extractedData.features || [],
            images: extractedData.images || [],
            content: extractedData.content || '',
            metadata: extractedData.metadata || {
                category: source.categories[0] || 'digital-product',
                tags: [],
                language: 'en'
            },
            seller: extractedData.seller,
            reviews: extractedData.reviews,
            scrapedAt: new Date(),
            status: 'success'
        };

        // Enhance with AI analysis if needed
        if (request.options?.extractContent) {
            await this.enhanceWithAIAnalysis(scrapedProduct);
        }

        return scrapedProduct;
    }

    /**
     * Get source-specific scraping options
     */
    private getSourceSpecificOptions(source: any): Partial<FirecrawlScrapeOptions> {
        const options: Partial<FirecrawlScrapeOptions> = {};

        // Add source-specific headers if needed
        switch (source.name.toLowerCase()) {
            case 'etsy':
                options.headers = {
                    'User-Agent': 'Mozilla/5.0 (compatible; ProductAnalyzer/1.0)'
                };
                break;
            case 'gumroad':
                options.waitFor = 3000; // Gumroad needs more time for dynamic content
                break;
            case 'udemy':
                options.excludeTags = ['script', 'style', 'nav', 'footer'];
                break;
        }

        return options;
    }

    /**
     * Enhance scraped data with AI analysis
     */
    private async enhanceWithAIAnalysis(product: ScrapedProduct): Promise<void> {
        try {
            const analysisPrompt = `
        Analyze this scraped product data and enhance it with additional insights:
        
        Title: ${product.title}
        Description: ${product.description}
        Content: ${product.content.substring(0, 1000)}...
        
        Please provide:
        1. Improved product categorization
        2. Additional relevant tags
        3. Target audience identification
        4. Key selling points
        5. Competitive advantages
        
        Return as JSON with keys: category, tags, targetAudience, sellingPoints, advantages
      `;

            const agentRequest: AgentRequest = {
                id: this.generateRequestId(),
                agentId: this.config.id,
                input: analysisPrompt,
                priority: 'normal'
            };

            const response = await this.processRequest(agentRequest);

            if (response.output && typeof response.output === 'string') {
                try {
                    const analysis = JSON.parse(response.output);

                    // Update product with AI insights
                    if (analysis.category) {
                        product.metadata.category = analysis.category;
                    }

                    if (analysis.tags && Array.isArray(analysis.tags)) {
                        product.metadata.tags = [...new Set([...product.metadata.tags, ...analysis.tags])];
                    }

                    // Add AI insights to metadata
                    product.metadata.aiInsights = {
                        targetAudience: analysis.targetAudience,
                        sellingPoints: analysis.sellingPoints,
                        advantages: analysis.advantages
                    };

                } catch (parseError) {
                    console.warn('Failed to parse AI analysis response:', parseError);
                }
            }
        } catch (error) {
            console.warn('AI enhancement failed:', error);
            // Continue without AI enhancement
        }
    }

    /**
     * Check rate limits and wait if necessary
     */
    private async checkAndWaitForRateLimit(source: string, maxRequestsPerHour: number): Promise<void> {
        const { allowed, waitTime } = await this.rateLimiter.checkRateLimit(source, maxRequestsPerHour);

        if (!allowed) {
            this.stats.rateLimitHits++;

            if (waitTime && waitTime > 0) {
                // If wait time is reasonable, wait
                if (waitTime < 5 * 60 * 1000) { // Less than 5 minutes
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                    throw new Error(`Rate limit exceeded for ${source}. Please try again in ${Math.ceil(waitTime / 60000)} minutes.`);
                }
            }
        }
    }

    /**
     * Batch scraping for multiple URLs
     */
    public async scrapeMultipleProducts(requests: ScrapingRequest[]): Promise<ScrapingResult[]> {
        const results: ScrapingResult[] = [];

        // Process requests with concurrency control
        const concurrency = 3; // Max 3 concurrent requests
        const chunks = this.chunkArray(requests, concurrency);

        for (const chunk of chunks) {
            const chunkResults = await Promise.allSettled(
                chunk.map(request => this.scrapeProduct(request))
            );

            chunkResults.forEach(result => {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                } else {
                    results.push({
                        success: false,
                        error: {
                            code: 'BATCH_SCRAPING_FAILED',
                            message: result.reason?.message || 'Unknown error',
                            details: result.reason
                        },
                        metadata: {
                            requestId: this.generateRequestId(),
                            duration: 0,
                            tokensUsed: 0,
                            cost: 0,
                            rateLimitRemaining: 0,
                            retryCount: 0
                        }
                    });
                }
            });

            // Add delay between chunks to respect rate limits
            if (chunks.indexOf(chunk) < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        return results;
    }

    /**
     * Get scraping statistics
     */
    public getStats(): ScrapingStats {
        return { ...this.stats };
    }

    /**
     * Reset statistics
     */
    public resetStats(): void {
        this.stats = {
            totalRequests: 0,
            successfulScrapes: 0,
            failedScrapes: 0,
            averageResponseTime: 0,
            rateLimitHits: 0,
            errorsByType: {},
            sourceStats: {}
        };
    }

    /**
     * Get supported sources
     */
    public getSupportedSources(): typeof SCRAPING_SOURCES {
        return SCRAPING_SOURCES;
    }

    /**
     * Check if URL is supported
     */
    public isUrlSupported(url: string): boolean {
        return getSourceByDomain(url) !== null;
    }

    // Implementation of abstract methods from EnhancedBaseAgent
    protected async processOutput(content: string, request: AgentRequest): Promise<unknown> {
        try {
            return JSON.parse(content);
        } catch {
            return { analysis: content };
        }
    }

    protected async getEmergencyFallback(request: AgentRequest): Promise<unknown> {
        return {
            error: 'AI analysis unavailable',
            fallback: true,
            message: 'Scraping completed but AI enhancement failed'
        };
    }

    public async process(input: unknown, context?: Record<string, unknown>): Promise<unknown> {
        if (typeof input === 'string' && this.isValidUrl(input)) {
            const request: ScrapingRequest = {
                url: input,
                options: context?.options as any,
                priority: (context?.priority as any) || 'normal',
                userId: context?.userId as string
            };

            return await this.scrapeProduct(request);
        }

        throw new Error('Invalid input: expected a valid URL');
    }

    // Utility methods
    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    private generateRequestId(): string {
        return `scrape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateProductId(): string {
        return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private updateSourceStats(source: string, success: boolean, responseTime: number): void {
        if (!this.stats.sourceStats[source]) {
            this.stats.sourceStats[source] = {
                requests: 0,
                successes: 0,
                failures: 0,
                avgResponseTime: 0
            };
        }

        const stats = this.stats.sourceStats[source];
        stats.requests++;

        if (success) {
            stats.successes++;
        } else {
            stats.failures++;
        }

        // Update average response time
        stats.avgResponseTime = (stats.avgResponseTime * (stats.requests - 1) + responseTime) / stats.requests;
    }

    private updateAverageResponseTime(responseTime: number): void {
        this.stats.averageResponseTime =
            (this.stats.averageResponseTime * (this.stats.totalRequests - 1) + responseTime) / this.stats.totalRequests;
    }

    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
}