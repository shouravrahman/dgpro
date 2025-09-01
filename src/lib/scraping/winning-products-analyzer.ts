import { ScrapingAgent } from './scraping-agent';
import { FacebookAdsIntelligence } from './facebook-ads-intelligence';
import { ScrapingRequest, ScrapedProduct } from './types';
import {
    getWinningProductSources,
    getSaaSIntelligenceSources,
    getTrendingSources,
    getRecommendedSources
} from './sources';

export interface WinningProduct {
    id: string;
    name: string;
    category: string;
    description: string;
    pricing: {
        type: 'free' | 'freemium' | 'one-time' | 'subscription';
        amount?: number;
        currency?: string;
        priceRange?: { min: number; max: number };
    };
    metrics: {
        trendingScore: number; // 0-100
        competitionLevel: 'low' | 'medium' | 'high';
        marketDemand: 'low' | 'medium' | 'high';
        profitability: 'low' | 'medium' | 'high';
        difficulty: 'easy' | 'medium' | 'hard';
    };
    sources: {
        platform: string;
        url: string;
        adFrequency?: number;
        socialMentions?: number;
        searchVolume?: number;
    }[];
    competitors: {
        name: string;
        url: string;
        pricing?: number;
        features: string[];
    }[];
    opportunities: {
        type: 'pricing' | 'features' | 'marketing' | 'niche';
        description: string;
        impact: 'low' | 'medium' | 'high';
    }[];
    risks: {
        type: 'saturation' | 'trend-decline' | 'platform-dependency' | 'legal';
        description: string;
        severity: 'low' | 'medium' | 'high';
    }[];
    recommendations: {
        action: string;
        priority: 'low' | 'medium' | 'high';
        timeframe: 'immediate' | 'short-term' | 'long-term';
    }[];
    lastAnalyzed: Date;
}

export interface MarketAnalysis {
    totalProductsAnalyzed: number;
    winningProducts: WinningProduct[];
    marketTrends: {
        category: string;
        growth: 'declining' | 'stable' | 'growing' | 'exploding';
        products: number;
        avgPrice: number;
        topFeatures: string[];
    }[];
    competitorLandscape: {
        totalCompetitors: number;
        marketLeaders: Array<{
            name: string;
            marketShare: number;
            products: string[];
        }>;
        emergingPlayers: string[];
    };
    insights: {
        hotCategories: string[];
        pricingTrends: string[];
        featureGaps: string[];
        marketOpportunities: string[];
    };
    generatedAt: Date;
}

export interface AnalysisConfig {
    categories?: string[];
    priceRange?: { min: number; max: number };
    sources?: string[];
    includeAds?: boolean;
    includeTrending?: boolean;
    includeSaaS?: boolean;
    timeframe?: 'week' | 'month' | 'quarter';
    minTrendingScore?: number;
    maxResults?: number;
}

export class WinningProductsAnalyzer {
    private scrapingAgent: ScrapingAgent;
    private facebookAdsIntel: FacebookAdsIntelligence;
    private productCache: Map<string, WinningProduct> = new Map();

    constructor(scrapingAgent: ScrapingAgent) {
        this.scrapingAgent = scrapingAgent;
        this.facebookAdsIntel = new FacebookAdsIntelligence(scrapingAgent);
    }

    /**
     * Analyze market to find winning digital products
     */
    public async analyzeWinningProducts(config: AnalysisConfig = {}): Promise<MarketAnalysis> {
        const {
            categories = ['software', 'courses', 'templates', 'saas', 'tools'],
            priceRange = { min: 10, max: 500 },
            sources,
            includeAds = true,
            includeTrending = true,
            includeSaaS = true,
            timeframe = 'month',
            minTrendingScore = 60,
            maxResults = 50
        } = config;

        console.log('🔍 Starting winning products analysis...');

        const analysis: MarketAnalysis = {
            totalProductsAnalyzed: 0,
            winningProducts: [],
            marketTrends: [],
            competitorLandscape: {
                totalCompetitors: 0,
                marketLeaders: [],
                emergingPlayers: []
            },
            insights: {
                hotCategories: [],
                pricingTrends: [],
                featureGaps: [],
                marketOpportunities: []
            },
            generatedAt: new Date()
        };

        // 1. Gather data from multiple sources
        const allProducts: ScrapedProduct[] = [];

        // Get trending products
        if (includeTrending) {
            console.log('📈 Analyzing trending products...');
            const trendingProducts = await this.scrapeTrendingProducts(categories);
            allProducts.push(...trendingProducts);
        }

        // Get SaaS intelligence
        if (includeSaaS) {
            console.log('💼 Analyzing SaaS products...');
            const saasProducts = await this.scrapeSaaSProducts(categories);
            allProducts.push(...saasProducts);
        }

        // Get Facebook Ads intelligence
        if (includeAds) {
            console.log('📱 Analyzing Facebook ads...');
            const adProducts = await this.analyzeAdsForProducts(categories);
            allProducts.push(...adProducts);
        }

        // Custom sources if specified
        if (sources && sources.length > 0) {
            console.log('🎯 Analyzing custom sources...');
            const customProducts = await this.scrapeCustomSources(sources, categories);
            allProducts.push(...customProducts);
        }

        analysis.totalProductsAnalyzed = allProducts.length;
        console.log(`📊 Analyzed ${allProducts.length} products total`);

        // 2. Process and score products
        const winningProducts = await this.processProducts(allProducts, {
            priceRange,
            minTrendingScore,
            categories
        });

        analysis.winningProducts = winningProducts.slice(0, maxResults);

        // 3. Generate market trends
        analysis.marketTrends = await this.analyzeMarketTrends(allProducts, categories);

        // 4. Analyze competitor landscape
        analysis.competitorLandscape = await this.analyzeCompetitors(allProducts);

        // 5. Generate insights
        analysis.insights = await this.generateInsights(allProducts, winningProducts);

        console.log('✅ Analysis complete!');
        return analysis;
    }

    /**
     * Deep dive analysis on specific product or category
     */
    public async deepDiveAnalysis(params: {
        productName?: string;
        category?: string;
        competitorUrls?: string[];
    }): Promise<{
        product?: WinningProduct;
        marketPosition: string;
        competitiveAdvantages: string[];
        threats: string[];
        recommendations: Array<{
            action: string;
            impact: string;
            effort: 'low' | 'medium' | 'high';
        }>;
    }> {
        const { productName, category, competitorUrls = [] } = params;

        let targetProduct: WinningProduct | undefined;

        if (productName) {
            // Find or analyze specific product
            const cached = Array.from(this.productCache.values())
                .find(p => p.name.toLowerCase().includes(productName.toLowerCase()));

            if (cached) {
                targetProduct = cached;
            } else {
                // Search for the product across sources
                const searchResults = await this.searchProduct(productName);
                if (searchResults.length > 0) {
                    const processed = await this.processProducts(searchResults, {});
                    targetProduct = processed[0];
                }
            }
        }

        // Analyze competitors
        const competitors = [];
        for (const url of competitorUrls) {
            try {
                const result = await this.scrapingAgent.scrapeProduct({
                    url,
                    priority: 'normal'
                });

                if (result.success && result.data) {
                    competitors.push(result.data);
                }
            } catch (error) {
                console.error(`Error analyzing competitor ${url}:`, error);
            }
        }

        // Generate deep analysis
        const marketPosition = this.determineMarketPosition(targetProduct, competitors);
        const competitiveAdvantages = this.identifyAdvantages(targetProduct, competitors);
        const threats = this.identifyThreats(targetProduct, competitors);
        const recommendations = this.generateRecommendations(targetProduct, competitors);

        return {
            product: targetProduct,
            marketPosition,
            competitiveAdvantages,
            threats,
            recommendations
        };
    }

    /**
     * Monitor products for changes and opportunities
     */
    public async monitorProducts(productIds: string[]): Promise<{
        updates: Array<{
            productId: string;
            changes: string[];
            newOpportunities: string[];
            alerts: Array<{
                type: 'price_change' | 'new_competitor' | 'trend_shift' | 'opportunity';
                message: string;
                severity: 'low' | 'medium' | 'high';
            }>;
        }>;
    }> {
        const updates = [];

        for (const productId of productIds) {
            const product = this.productCache.get(productId);
            if (!product) continue;

            try {
                // Re-analyze the product
                const freshData = await this.searchProduct(product.name);
                const freshAnalysis = await this.processProducts(freshData, {});

                if (freshAnalysis.length > 0) {
                    const updatedProduct = freshAnalysis[0];
                    const changes = this.detectChanges(product, updatedProduct);
                    const newOpportunities = this.detectNewOpportunities(product, updatedProduct);
                    const alerts = this.generateAlerts(product, updatedProduct);

                    updates.push({
                        productId,
                        changes,
                        newOpportunities,
                        alerts
                    });

                    // Update cache
                    this.productCache.set(productId, updatedProduct);
                }
            } catch (error) {
                console.error(`Error monitoring product ${productId}:`, error);
            }
        }

        return { updates };
    }

    // Private helper methods

    private async scrapeTrendingProducts(categories: string[]): Promise<ScrapedProduct[]> {
        const sources = getTrendingSources();
        const products: ScrapedProduct[] = [];

        for (const source of sources.slice(0, 5)) { // Limit to top 5 sources
            try {
                for (const category of categories) {
                    const searchUrl = this.buildSearchUrl(source, category);

                    const result = await this.scrapingAgent.scrapeProduct({
                        url: searchUrl,
                        priority: 'normal',
                        options: { respectRateLimit: true }
                    });

                    if (result.success && result.data) {
                        products.push(result.data);
                    }

                    // Rate limiting
                    await this.delay(1000);
                }
            } catch (error) {
                console.error(`Error scraping ${source.name}:`, error);
            }
        }

        return products;
    }

    private async scrapeSaaSProducts(categories: string[]): Promise<ScrapedProduct[]> {
        const sources = getSaaSIntelligenceSources();
        const products: ScrapedProduct[] = [];

        for (const source of sources.slice(0, 3)) {
            try {
                const searchUrl = this.buildSearchUrl(source, 'saas');

                const result = await this.scrapingAgent.scrapeProduct({
                    url: searchUrl,
                    priority: 'normal'
                });

                if (result.success && result.data) {
                    products.push(result.data);
                }

                await this.delay(2000); // More conservative for SaaS sources
            } catch (error) {
                console.error(`Error scraping SaaS from ${source.name}:`, error);
            }
        }

        return products;
    }

    private async analyzeAdsForProducts(categories: string[]): Promise<ScrapedProduct[]> {
        const products: ScrapedProduct[] = [];

        try {
            const ads = await this.facebookAdsIntel.searchAds({
                keywords: categories,
                activeStatus: 'active',
                limit: 100
            });

            // Convert ads to product format
            for (const ad of ads) {
                if (ad.extractedProducts && ad.extractedProducts.length > 0) {
                    for (const product of ad.extractedProducts) {
                        const scrapedProduct: ScrapedProduct = {
                            id: `ad_product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            url: ad.landingPageUrl || `https://facebook.com/ads/library`,
                            source: 'Facebook Ads',
                            title: product.name,
                            description: product.description,
                            pricing: {
                                type: 'one-time',
                                amount: product.price ? parseFloat(product.price.replace(/[^0-9.]/g, '')) : undefined,
                                currency: 'USD'
                            },
                            features: [],
                            images: ad.images,
                            content: ad.adBody,
                            metadata: {
                                category: product.category,
                                tags: [ad.advertiserName],
                                language: 'en',
                                adFrequency: 1 // Will be aggregated later
                            },
                            scrapedAt: new Date(),
                            status: 'success'
                        };

                        products.push(scrapedProduct);
                    }
                }
            }
        } catch (error) {
            console.error('Error analyzing Facebook ads:', error);
        }

        return products;
    }

    private async scrapeCustomSources(sources: string[], categories: string[]): Promise<ScrapedProduct[]> {
        const products: ScrapedProduct[] = [];

        for (const sourceUrl of sources) {
            try {
                const result = await this.scrapingAgent.scrapeProduct({
                    url: sourceUrl,
                    priority: 'normal'
                });

                if (result.success && result.data) {
                    products.push(result.data);
                }
            } catch (error) {
                console.error(`Error scraping custom source ${sourceUrl}:`, error);
            }
        }

        return products;
    }

    private async processProducts(
        products: ScrapedProduct[],
        filters: {
            priceRange?: { min: number; max: number };
            minTrendingScore?: number;
            categories?: string[];
        }
    ): Promise<WinningProduct[]> {
        const winningProducts: WinningProduct[] = [];

        for (const product of products) {
            try {
                // Apply filters
                if (filters.priceRange && product.pricing?.amount) {
                    if (product.pricing.amount < filters.priceRange.min ||
                        product.pricing.amount > filters.priceRange.max) {
                        continue;
                    }
                }

                if (filters.categories && filters.categories.length > 0) {
                    if (!filters.categories.includes(product.metadata?.category || '')) {
                        continue;
                    }
                }

                const winningProduct = await this.convertToWinningProduct(product);

                if (filters.minTrendingScore && winningProduct.metrics.trendingScore < filters.minTrendingScore) {
                    continue;
                }

                winningProducts.push(winningProduct);
                this.productCache.set(winningProduct.id, winningProduct);

            } catch (error) {
                console.error('Error processing product:', error);
            }
        }

        return winningProducts.sort((a, b) => b.metrics.trendingScore - a.metrics.trendingScore);
    }

    private async convertToWinningProduct(product: ScrapedProduct): Promise<WinningProduct> {
        const trendingScore = this.calculateTrendingScore(product);
        const metrics = await this.calculateMetrics(product);
        const competitors = await this.findCompetitors(product);
        const opportunities = this.identifyOpportunities(product, competitors);
        const risks = this.assessRisks(product);
        const recommendations = this.generateProductRecommendations(product, opportunities, risks);

        return {
            id: product.id,
            name: product.title,
            category: product.metadata?.category || 'digital-product',
            description: product.description,
            pricing: {
                type: product.pricing?.type || 'one-time',
                amount: product.pricing?.amount,
                currency: product.pricing?.currency || 'USD'
            },
            metrics,
            sources: [{
                platform: product.source,
                url: product.url,
                adFrequency: product.metadata?.adFrequency
            }],
            competitors,
            opportunities,
            risks,
            recommendations,
            lastAnalyzed: new Date()
        };
    }

    private calculateTrendingScore(product: ScrapedProduct): number {
        let score = 0;

        // Base score from source credibility
        const sourceScores: Record<string, number> = {
            'Product Hunt': 30,
            'Facebook Ads': 25,
            'Whop': 20,
            'Indie Hackers': 20,
            'BetaList': 15,
            'Gumroad': 15
        };
        score += sourceScores[product.source] || 10;

        // Price optimization (sweet spot for digital products)
        if (product.pricing?.amount) {
            const price = product.pricing.amount;
            if (price >= 20 && price <= 100) {
                score += 20;
            } else if (price >= 10 && price <= 200) {
                score += 15;
            } else if (price >= 5 && price <= 500) {
                score += 10;
            }
        }

        // Feature richness
        if (product.features && product.features.length > 0) {
            score += Math.min(product.features.length * 2, 15);
        }

        // Content quality
        if (product.description && product.description.length > 100) {
            score += 10;
        }

        // Visual appeal
        if (product.images && product.images.length > 0) {
            score += Math.min(product.images.length * 3, 15);
        }

        // Category bonus
        const hotCategories = ['ai', 'productivity', 'marketing', 'design', 'development'];
        if (hotCategories.some(cat => product.metadata?.category?.includes(cat))) {
            score += 10;
        }

        return Math.min(score, 100);
    }

    private async calculateMetrics(product: ScrapedProduct): Promise<WinningProduct['metrics']> {
        const trendingScore = this.calculateTrendingScore(product);

        return {
            trendingScore,
            competitionLevel: trendingScore > 70 ? 'high' : trendingScore > 40 ? 'medium' : 'low',
            marketDemand: this.assessMarketDemand(product),
            profitability: this.assessProfitability(product),
            difficulty: this.assessDifficulty(product)
        };
    }

    private assessMarketDemand(product: ScrapedProduct): 'low' | 'medium' | 'high' {
        // Simple heuristic based on category and features
        const highDemandCategories = ['productivity', 'marketing', 'ai', 'saas'];
        const category = product.metadata?.category || '';

        if (highDemandCategories.some(cat => category.includes(cat))) {
            return 'high';
        }

        if (product.features && product.features.length > 5) {
            return 'medium';
        }

        return 'low';
    }

    private assessProfitability(product: ScrapedProduct): 'low' | 'medium' | 'high' {
        const price = product.pricing?.amount || 0;

        if (price >= 50) return 'high';
        if (price >= 20) return 'medium';
        return 'low';
    }

    private assessDifficulty(product: ScrapedProduct): 'easy' | 'medium' | 'hard' {
        const complexCategories = ['saas', 'software', 'ai'];
        const category = product.metadata?.category || '';

        if (complexCategories.some(cat => category.includes(cat))) {
            return 'hard';
        }

        if (product.features && product.features.length > 10) {
            return 'medium';
        }

        return 'easy';
    }

    private async findCompetitors(product: ScrapedProduct): Promise<WinningProduct['competitors']> {
        // Mock implementation - in production, search for similar products
        return [
            {
                name: `Competitor of ${product.title}`,
                url: 'https://example.com',
                pricing: (product.pricing?.amount || 0) * 1.2,
                features: product.features?.slice(0, 3) || []
            }
        ];
    }

    private identifyOpportunities(product: ScrapedProduct, competitors: WinningProduct['competitors']): WinningProduct['opportunities'] {
        const opportunities = [];

        // Pricing opportunities
        if (competitors.length > 0) {
            const avgCompetitorPrice = competitors.reduce((sum, comp) => sum + (comp.pricing || 0), 0) / competitors.length;
            const productPrice = product.pricing?.amount || 0;

            if (productPrice < avgCompetitorPrice * 0.8) {
                opportunities.push({
                    type: 'pricing' as const,
                    description: 'Price is significantly lower than competitors - opportunity to increase',
                    impact: 'medium' as const
                });
            }
        }

        // Feature opportunities
        if (!product.features || product.features.length < 5) {
            opportunities.push({
                type: 'features' as const,
                description: 'Limited features compared to market standards',
                impact: 'high' as const
            });
        }

        return opportunities;
    }

    private assessRisks(product: ScrapedProduct): WinningProduct['risks'] {
        const risks = [];

        // Market saturation risk
        if (product.source === 'Facebook Ads') {
            risks.push({
                type: 'saturation' as const,
                description: 'High advertising activity suggests market saturation',
                severity: 'medium' as const
            });
        }

        // Platform dependency risk
        if (product.source.includes('Shopify') || product.source.includes('Chrome')) {
            risks.push({
                type: 'platform-dependency' as const,
                description: 'Success depends on platform policies and changes',
                severity: 'medium' as const
            });
        }

        return risks;
    }

    private generateProductRecommendations(
        product: ScrapedProduct,
        opportunities: WinningProduct['opportunities'],
        risks: WinningProduct['risks']
    ): WinningProduct['recommendations'] {
        const recommendations = [];

        // Based on opportunities
        opportunities.forEach(opp => {
            if (opp.type === 'pricing' && opp.impact === 'medium') {
                recommendations.push({
                    action: 'Consider gradual price increase testing',
                    priority: 'medium' as const,
                    timeframe: 'short-term' as const
                });
            }
        });

        // Based on risks
        risks.forEach(risk => {
            if (risk.type === 'platform-dependency') {
                recommendations.push({
                    action: 'Diversify distribution channels',
                    priority: 'high' as const,
                    timeframe: 'long-term' as const
                });
            }
        });

        return recommendations;
    }

    private async analyzeMarketTrends(products: ScrapedProduct[], categories: string[]): Promise<MarketAnalysis['marketTrends']> {
        const trends = [];

        for (const category of categories) {
            const categoryProducts = products.filter(p => p.metadata?.category?.includes(category));

            if (categoryProducts.length > 0) {
                const avgPrice = categoryProducts.reduce((sum, p) => sum + (p.pricing?.amount || 0), 0) / categoryProducts.length;
                const topFeatures = this.extractTopFeatures(categoryProducts);

                trends.push({
                    category,
                    growth: 'growing' as const, // Mock - would analyze historical data
                    products: categoryProducts.length,
                    avgPrice,
                    topFeatures
                });
            }
        }

        return trends;
    }

    private async analyzeCompetitors(products: ScrapedProduct[]): Promise<MarketAnalysis['competitorLandscape']> {
        const competitors = new Map<string, number>();

        products.forEach(product => {
            const source = product.source;
            competitors.set(source, (competitors.get(source) || 0) + 1);
        });

        const marketLeaders = Array.from(competitors.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({
                name,
                marketShare: (count / products.length) * 100,
                products: [name] // Simplified
            }));

        return {
            totalCompetitors: competitors.size,
            marketLeaders,
            emergingPlayers: Array.from(competitors.keys()).slice(5, 10)
        };
    }

    private async generateInsights(products: ScrapedProduct[], winningProducts: WinningProduct[]): Promise<MarketAnalysis['insights']> {
        const categories = new Map<string, number>();
        const prices = [];

        products.forEach(product => {
            const category = product.metadata?.category || 'unknown';
            categories.set(category, (categories.get(category) || 0) + 1);

            if (product.pricing?.amount) {
                prices.push(product.pricing.amount);
            }
        });

        const hotCategories = Array.from(categories.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([category]) => category);

        const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

        return {
            hotCategories,
            pricingTrends: [
                `Average price: $${avgPrice.toFixed(2)}`,
                prices.length > 10 ? 'Price range varies significantly' : 'Consistent pricing'
            ],
            featureGaps: ['AI integration', 'Mobile optimization', 'Analytics dashboard'],
            marketOpportunities: [
                'Underserved niches in productivity tools',
                'Growing demand for AI-powered solutions',
                'Opportunity in subscription models'
            ]
        };
    }

    // Additional helper methods

    private buildSearchUrl(source: any, category: string): string {
        // Build search URLs for different platforms
        const baseUrl = `https://${source.domain}`;

        switch (source.name) {
            case 'Product Hunt':
                return `${baseUrl}/topics/${category}`;
            case 'Whop':
                return `${baseUrl}/explore?category=${category}`;
            case 'Indie Hackers':
                return `${baseUrl}/products?category=${category}`;
            default:
                return `${baseUrl}/search?q=${category}`;
        }
    }

    private extractTopFeatures(products: ScrapedProduct[]): string[] {
        const featureCount = new Map<string, number>();

        products.forEach(product => {
            product.features?.forEach(feature => {
                featureCount.set(feature, (featureCount.get(feature) || 0) + 1);
            });
        });

        return Array.from(featureCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([feature]) => feature);
    }

    private async searchProduct(productName: string): Promise<ScrapedProduct[]> {
        // Search across multiple sources for a specific product
        const sources = getWinningProductSources().slice(0, 3);
        const results = [];

        for (const source of sources) {
            try {
                const searchUrl = `https://${source.domain}/search?q=${encodeURIComponent(productName)}`;

                const result = await this.scrapingAgent.scrapeProduct({
                    url: searchUrl,
                    priority: 'normal'
                });

                if (result.success && result.data) {
                    results.push(result.data);
                }
            } catch (error) {
                console.error(`Error searching for ${productName} on ${source.name}:`, error);
            }
        }

        return results;
    }

    private determineMarketPosition(product?: WinningProduct, competitors: ScrapedProduct[] = []): string {
        if (!product) return 'Unknown position';

        if (competitors.length === 0) return 'First mover advantage';

        const avgCompetitorPrice = competitors.reduce((sum, comp) =>
            sum + (comp.pricing?.amount || 0), 0) / competitors.length;

        const productPrice = product.pricing.amount || 0;

        if (productPrice < avgCompetitorPrice * 0.8) {
            return 'Cost leader';
        } else if (productPrice > avgCompetitorPrice * 1.2) {
            return 'Premium player';
        } else {
            return 'Market follower';
        }
    }

    private identifyAdvantages(product?: WinningProduct, competitors: ScrapedProduct[] = []): string[] {
        if (!product) return [];

        const advantages = [];

        if (product.metrics.trendingScore > 80) {
            advantages.push('High market traction');
        }

        if (competitors.length > 0) {
            const avgFeatures = competitors.reduce((sum, comp) =>
                sum + (comp.features?.length || 0), 0) / competitors.length;

            // This would need to be implemented properly with actual feature comparison
            advantages.push('Competitive feature set');
        }

        return advantages;
    }

    private identifyThreats(product?: WinningProduct, competitors: ScrapedProduct[] = []): string[] {
        const threats = [];

        if (competitors.length > 5) {
            threats.push('High competition');
        }

        if (product?.metrics.competitionLevel === 'high') {
            threats.push('Market saturation risk');
        }

        return threats;
    }

    private generateRecommendations(product?: WinningProduct, competitors: ScrapedProduct[] = []): Array<{
        action: string;
        impact: string;
        effort: 'low' | 'medium' | 'high';
    }> {
        const recommendations = [];

        if (competitors.length > 3) {
            recommendations.push({
                action: 'Focus on unique value proposition',
                impact: 'Differentiate from crowded market',
                effort: 'medium' as const
            });
        }

        if (product && product.pricing.amount && product.pricing.amount < 50) {
            recommendations.push({
                action: 'Consider premium pricing strategy',
                impact: 'Increase profit margins',
                effort: 'low' as const
            });
        }

        return recommendations;
    }

    private detectChanges(oldProduct: WinningProduct, newProduct: WinningProduct): string[] {
        const changes = [];

        if (oldProduct.pricing.amount !== newProduct.pricing.amount) {
            changes.push(`Price changed from $${oldProduct.pricing.amount} to $${newProduct.pricing.amount}`);
        }

        if (oldProduct.metrics.trendingScore !== newProduct.metrics.trendingScore) {
            const direction = newProduct.metrics.trendingScore > oldProduct.metrics.trendingScore ? 'increased' : 'decreased';
            changes.push(`Trending score ${direction} from ${oldProduct.metrics.trendingScore} to ${newProduct.metrics.trendingScore}`);
        }

        return changes;
    }

    private detectNewOpportunities(oldProduct: WinningProduct, newProduct: WinningProduct): string[] {
        const opportunities = [];

        if (newProduct.opportunities.length > oldProduct.opportunities.length) {
            opportunities.push('New market opportunities identified');
        }

        return opportunities;
    }

    private generateAlerts(oldProduct: WinningProduct, newProduct: WinningProduct): Array<{
        type: 'price_change' | 'new_competitor' | 'trend_shift' | 'opportunity';
        message: string;
        severity: 'low' | 'medium' | 'high';
    }> {
        const alerts = [];

        if (oldProduct.pricing.amount !== newProduct.pricing.amount) {
            alerts.push({
                type: 'price_change',
                message: `Price changed for ${newProduct.name}`,
                severity: 'medium'
            });
        }

        return alerts;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}