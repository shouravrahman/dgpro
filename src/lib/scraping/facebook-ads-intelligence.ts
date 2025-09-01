import { ScrapingAgent } from './scraping-agent';
import { ScrapingRequest, ScrapedProduct } from './types';
import { getSourceByDomain } from './sources';

export interface FacebookAdData {
    id: string;
    advertiserName: string;
    adTitle: string;
    adBody: string;
    callToAction?: string;
    landingPageUrl?: string;
    images: string[];
    videos?: string[];
    startDate: Date;
    isActive: boolean;
    impressions?: string; // Facebook shows ranges like "1K-5K"
    spend?: string;
    demographics?: {
        ageRange?: string;
        gender?: string;
        locations?: string[];
    };
    productCategory?: string;
    extractedProducts?: {
        name: string;
        price?: string;
        description: string;
        category: string;
        confidence: number; // 0-1 score for product detection accuracy
    }[];
}

export interface AdIntelligenceReport {
    totalAdsAnalyzed: number;
    activeAds: number;
    topAdvertisers: Array<{
        name: string;
        adCount: number;
        categories: string[];
    }>;
    trendingProducts: Array<{
        name: string;
        frequency: number;
        avgPrice?: number;
        category: string;
        advertisers: string[];
    }>;
    topCategories: Array<{
        category: string;
        adCount: number;
        percentage: number;
    }>;
    insights: {
        mostCommonCTAs: string[];
        averageAdDuration: number;
        peakAdvertisingDays: string[];
        emergingTrends: string[];
    };
    generatedAt: Date;
}

export class FacebookAdsIntelligence {
    private scrapingAgent: ScrapingAgent;
    private adCache: Map<string, FacebookAdData> = new Map();

    constructor(scrapingAgent: ScrapingAgent) {
        this.scrapingAgent = scrapingAgent;
    }

    /**
     * Search Facebook Ads Library for specific keywords or categories
     */
    public async searchAds(params: {
        keywords?: string[];
        categories?: string[];
        country?: string;
        adType?: 'all' | 'political' | 'issues';
        activeStatus?: 'active' | 'inactive' | 'all';
        limit?: number;
    }): Promise<FacebookAdData[]> {
        const { keywords = [], categories = [], country = 'US', adType = 'all', activeStatus = 'active', limit = 50 } = params;

        const searchQueries = [...keywords, ...categories];
        const ads: FacebookAdData[] = [];

        for (const query of searchQueries) {
            try {
                // Construct Facebook Ads Library URL
                const searchUrl = this.buildFacebookAdsUrl({
                    q: query,
                    country,
                    adType,
                    activeStatus
                });

                const scrapingRequest: ScrapingRequest = {
                    url: searchUrl,
                    options: {
                        includeImages: true,
                        includeMetadata: true,
                        extractContent: true,
                        timeout: 30000,
                        respectRateLimit: true
                    },
                    priority: 'normal'
                };

                const result = await this.scrapingAgent.scrapeProduct(scrapingRequest);

                if (result.success && result.data) {
                    const extractedAds = await this.parseAdsFromScrapedData(result.data, query);
                    ads.push(...extractedAds);

                    // Cache the ads
                    extractedAds.forEach(ad => {
                        this.adCache.set(ad.id, ad);
                    });
                }

                // Respect rate limits
                await this.delay(2000);

                if (ads.length >= limit) {
                    break;
                }
            } catch (error) {
                console.error(`Error searching ads for query "${query}":`, error);
            }
        }

        return ads.slice(0, limit);
    }

    /**
     * Analyze ads to identify trending digital products
     */
    public async analyzeTrendingProducts(ads: FacebookAdData[]): Promise<AdIntelligenceReport> {
        const report: AdIntelligenceReport = {
            totalAdsAnalyzed: ads.length,
            activeAds: ads.filter(ad => ad.isActive).length,
            topAdvertisers: [],
            trendingProducts: [],
            topCategories: [],
            insights: {
                mostCommonCTAs: [],
                averageAdDuration: 0,
                peakAdvertisingDays: [],
                emergingTrends: []
            },
            generatedAt: new Date()
        };

        // Analyze advertisers
        const advertiserMap = new Map<string, { count: number; categories: Set<string> }>();
        ads.forEach(ad => {
            const existing = advertiserMap.get(ad.advertiserName) || { count: 0, categories: new Set() };
            existing.count++;
            if (ad.productCategory) {
                existing.categories.add(ad.productCategory);
            }
            advertiserMap.set(ad.advertiserName, existing);
        });

        report.topAdvertisers = Array.from(advertiserMap.entries())
            .map(([name, data]) => ({
                name,
                adCount: data.count,
                categories: Array.from(data.categories)
            }))
            .sort((a, b) => b.adCount - a.adCount)
            .slice(0, 10);

        // Analyze products
        const productMap = new Map<string, {
            frequency: number;
            prices: number[];
            category: string;
            advertisers: Set<string>;
        }>();

        ads.forEach(ad => {
            ad.extractedProducts?.forEach(product => {
                const existing = productMap.get(product.name) || {
                    frequency: 0,
                    prices: [],
                    category: product.category,
                    advertisers: new Set()
                };

                existing.frequency++;
                existing.advertisers.add(ad.advertiserName);

                if (product.price) {
                    const price = this.extractPriceNumber(product.price);
                    if (price > 0) {
                        existing.prices.push(price);
                    }
                }

                productMap.set(product.name, existing);
            });
        });

        report.trendingProducts = Array.from(productMap.entries())
            .map(([name, data]) => ({
                name,
                frequency: data.frequency,
                avgPrice: data.prices.length > 0 ? data.prices.reduce((a, b) => a + b, 0) / data.prices.length : undefined,
                category: data.category,
                advertisers: Array.from(data.advertisers)
            }))
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 20);

        // Analyze categories
        const categoryMap = new Map<string, number>();
        ads.forEach(ad => {
            if (ad.productCategory) {
                categoryMap.set(ad.productCategory, (categoryMap.get(ad.productCategory) || 0) + 1);
            }
        });

        const totalCategorized = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);
        report.topCategories = Array.from(categoryMap.entries())
            .map(([category, count]) => ({
                category,
                adCount: count,
                percentage: (count / totalCategorized) * 100
            }))
            .sort((a, b) => b.adCount - a.adCount);

        // Generate insights
        report.insights = await this.generateInsights(ads);

        return report;
    }

    /**
     * Find winning products based on ad frequency and engagement signals
     */
    public async findWinningProducts(params: {
        categories?: string[];
        minAdFrequency?: number;
        priceRange?: { min: number; max: number };
        timeframe?: 'week' | 'month' | 'quarter';
    }): Promise<Array<{
        product: any;
        winningScore: number;
        reasons: string[];
        competitorCount: number;
        estimatedRevenue?: number;
    }>> {
        const { categories = [], minAdFrequency = 5, priceRange, timeframe = 'month' } = params;

        // Search for ads in specified categories
        const searchKeywords = categories.length > 0 ? categories : [
            'course', 'ebook', 'template', 'software', 'app', 'tool',
            'digital product', 'online course', 'masterclass', 'guide'
        ];

        const ads = await this.searchAds({
            keywords: searchKeywords,
            activeStatus: 'active',
            limit: 200
        });

        const report = await this.analyzeTrendingProducts(ads);
        const winningProducts = [];

        for (const product of report.trendingProducts) {
            if (product.frequency < minAdFrequency) continue;

            if (priceRange && product.avgPrice) {
                if (product.avgPrice < priceRange.min || product.avgPrice > priceRange.max) {
                    continue;
                }
            }

            const winningScore = this.calculateWinningScore(product, ads);
            const reasons = this.getWinningReasons(product, ads);

            winningProducts.push({
                product,
                winningScore,
                reasons,
                competitorCount: product.advertisers.length,
                estimatedRevenue: this.estimateRevenue(product, ads)
            });
        }

        return winningProducts
            .sort((a, b) => b.winningScore - a.winningScore)
            .slice(0, 10);
    }

    /**
     * Monitor competitor ads for specific products or advertisers
     */
    public async monitorCompetitors(params: {
        competitors: string[];
        products?: string[];
        alertThresholds?: {
            newAds?: number;
            spendIncrease?: number;
        };
    }): Promise<{
        competitorActivity: Array<{
            advertiser: string;
            newAds: number;
            totalActiveAds: number;
            categories: string[];
            recentChanges: string[];
        }>;
        alerts: Array<{
            type: 'new_advertiser' | 'spend_increase' | 'new_product' | 'strategy_change';
            message: string;
            severity: 'low' | 'medium' | 'high';
            data: any;
        }>;
    }> {
        const { competitors, products = [], alertThresholds = {} } = params;

        const competitorActivity = [];
        const alerts = [];

        for (const competitor of competitors) {
            try {
                const ads = await this.searchAds({
                    keywords: [competitor],
                    activeStatus: 'active',
                    limit: 100
                });

                const advertiserAds = ads.filter(ad =>
                    ad.advertiserName.toLowerCase().includes(competitor.toLowerCase())
                );

                const categories = [...new Set(advertiserAds.map(ad => ad.productCategory).filter(Boolean))];

                competitorActivity.push({
                    advertiser: competitor,
                    newAds: advertiserAds.length,
                    totalActiveAds: advertiserAds.filter(ad => ad.isActive).length,
                    categories,
                    recentChanges: this.detectChanges(advertiserAds)
                });

                // Generate alerts based on thresholds
                if (alertThresholds.newAds && advertiserAds.length > alertThresholds.newAds) {
                    alerts.push({
                        type: 'new_advertiser',
                        message: `${competitor} has ${advertiserAds.length} new ads (threshold: ${alertThresholds.newAds})`,
                        severity: 'medium',
                        data: { competitor, adCount: advertiserAds.length }
                    });
                }

            } catch (error) {
                console.error(`Error monitoring competitor ${competitor}:`, error);
            }
        }

        return { competitorActivity, alerts };
    }

    // Private helper methods

    private buildFacebookAdsUrl(params: {
        q: string;
        country: string;
        adType: string;
        activeStatus: string;
    }): string {
        const baseUrl = 'https://www.facebook.com/ads/library';
        const searchParams = new URLSearchParams({
            active_status: params.activeStatus,
            ad_type: params.adType,
            country: params.country,
            q: params.q,
            sort_data: JSON.stringify([{ direction: 'desc', mode: 'relevancy_monthly_grouped' }])
        });

        return `${baseUrl}?${searchParams.toString()}`;
    }

    private async parseAdsFromScrapedData(scrapedData: ScrapedProduct, query: string): Promise<FacebookAdData[]> {
        const ads: FacebookAdData[] = [];

        try {
            // Use AI to extract structured ad data from scraped content
            const extractionPrompt = `
        Analyze this Facebook Ads Library page content and extract individual ad information:
        
        Content: ${scrapedData.content.substring(0, 5000)}
        
        For each ad found, extract:
        - Advertiser name
        - Ad title/headline
        - Ad body text
        - Call to action
        - Any product mentions
        - Pricing information
        - Category/industry
        
        Return as JSON array of ad objects.
      `;

            // This would use the AI agent to process the content
            // For now, we'll create a mock structure
            const mockAd: FacebookAdData = {
                id: `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                advertiserName: this.extractAdvertiserName(scrapedData.content),
                adTitle: scrapedData.title,
                adBody: scrapedData.description,
                images: scrapedData.images,
                startDate: new Date(),
                isActive: true,
                productCategory: this.categorizeAd(scrapedData.content, query),
                extractedProducts: this.extractProductsFromAd(scrapedData)
            };

            ads.push(mockAd);

        } catch (error) {
            console.error('Error parsing ad data:', error);
        }

        return ads;
    }

    private extractAdvertiserName(content: string): string {
        // Simple extraction - in production, use more sophisticated parsing
        const patterns = [
            /Advertiser:\s*([^\\n]+)/i,
            /By\s+([^\\n]+)/i,
            /Sponsored by\s+([^\\n]+)/i
        ];

        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }

        return 'Unknown Advertiser';
    }

    private categorizeAd(content: string, query: string): string {
        const categories = {
            'course': ['course', 'training', 'learn', 'education', 'masterclass'],
            'software': ['software', 'app', 'tool', 'platform', 'saas'],
            'ebook': ['ebook', 'book', 'guide', 'pdf', 'download'],
            'template': ['template', 'design', 'theme', 'layout'],
            'service': ['service', 'consulting', 'agency', 'done-for-you']
        };

        const lowerContent = content.toLowerCase();

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lowerContent.includes(keyword))) {
                return category;
            }
        }

        return query.toLowerCase();
    }

    private extractProductsFromAd(scrapedData: ScrapedProduct): FacebookAdData['extractedProducts'] {
        const products = [];

        // Extract main product
        if (scrapedData.title && scrapedData.description) {
            products.push({
                name: scrapedData.title,
                price: scrapedData.pricing?.amount ? `$${scrapedData.pricing.amount}` : undefined,
                description: scrapedData.description,
                category: scrapedData.metadata?.category || 'digital-product',
                confidence: 0.8
            });
        }

        return products;
    }

    private calculateWinningScore(product: any, ads: FacebookAdData[]): number {
        let score = 0;

        // Frequency score (0-40 points)
        score += Math.min(product.frequency * 2, 40);

        // Competitor diversity score (0-20 points)
        score += Math.min(product.advertisers.length * 2, 20);

        // Price optimization score (0-20 points)
        if (product.avgPrice) {
            if (product.avgPrice >= 20 && product.avgPrice <= 200) {
                score += 20; // Sweet spot for digital products
            } else if (product.avgPrice >= 10 && product.avgPrice <= 500) {
                score += 10;
            }
        }

        // Category popularity score (0-20 points)
        const categoryAds = ads.filter(ad => ad.productCategory === product.category);
        score += Math.min(categoryAds.length, 20);

        return Math.min(score, 100);
    }

    private getWinningReasons(product: any, ads: FacebookAdData[]): string[] {
        const reasons = [];

        if (product.frequency >= 10) {
            reasons.push(`High ad frequency (${product.frequency} ads)`);
        }

        if (product.advertisers.length >= 5) {
            reasons.push(`Multiple competitors (${product.advertisers.length} advertisers)`);
        }

        if (product.avgPrice && product.avgPrice >= 20 && product.avgPrice <= 200) {
            reasons.push(`Optimal price point ($${product.avgPrice.toFixed(2)})`);
        }

        const categoryAds = ads.filter(ad => ad.productCategory === product.category);
        if (categoryAds.length >= 20) {
            reasons.push(`Popular category (${product.category})`);
        }

        return reasons;
    }

    private estimateRevenue(product: any, ads: FacebookAdData[]): number | undefined {
        if (!product.avgPrice || product.advertisers.length === 0) {
            return undefined;
        }

        // Very rough estimation based on ad frequency and price
        const estimatedSalesPerAdvertiser = product.frequency * 10; // Assume 10 sales per ad
        const totalEstimatedSales = estimatedSalesPerAdvertiser * product.advertisers.length;

        return totalEstimatedSales * product.avgPrice;
    }

    private async generateInsights(ads: FacebookAdData[]): Promise<AdIntelligenceReport['insights']> {
        const ctas = ads.map(ad => ad.callToAction).filter(Boolean);
        const ctaFreq = new Map<string, number>();
        ctas.forEach(cta => {
            ctaFreq.set(cta!, (ctaFreq.get(cta!) || 0) + 1);
        });

        const mostCommonCTAs = Array.from(ctaFreq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([cta]) => cta);

        return {
            mostCommonCTAs,
            averageAdDuration: 30, // Mock data
            peakAdvertisingDays: ['Monday', 'Tuesday', 'Wednesday'],
            emergingTrends: this.detectEmergingTrends(ads)
        };
    }

    private detectEmergingTrends(ads: FacebookAdData[]): string[] {
        // Analyze recent ads for emerging patterns
        const recentAds = ads.filter(ad => {
            const daysSinceStart = (Date.now() - ad.startDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceStart <= 7;
        });

        const trends = [];

        // Look for new keywords appearing frequently
        const keywords = new Map<string, number>();
        recentAds.forEach(ad => {
            const words = (ad.adTitle + ' ' + ad.adBody).toLowerCase().split(/\s+/);
            words.forEach(word => {
                if (word.length > 4) {
                    keywords.set(word, (keywords.get(word) || 0) + 1);
                }
            });
        });

        const emergingKeywords = Array.from(keywords.entries())
            .filter(([, count]) => count >= 3)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([keyword]) => keyword);

        trends.push(...emergingKeywords);

        return trends;
    }

    private detectChanges(ads: FacebookAdData[]): string[] {
        // Mock implementation - in production, compare with historical data
        const changes = [];

        if (ads.length > 10) {
            changes.push('Increased ad volume');
        }

        const categories = [...new Set(ads.map(ad => ad.productCategory))];
        if (categories.length > 3) {
            changes.push('Diversified product categories');
        }

        return changes;
    }

    private extractPriceNumber(priceStr: string): number {
        const match = priceStr.match(/[\d,]+\.?\d*/);
        return match ? parseFloat(match[0].replace(',', '')) : 0;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}