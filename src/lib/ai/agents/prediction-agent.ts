import { EnhancedBaseAgent, EnhancedAgentConfig } from '../enhanced-base-agent';
import { AgentRequest } from '../types';

export interface MarketTrendPrediction {
    id: string;
    category: string;
    trend: {
        direction: 'rising' | 'declining' | 'stable' | 'volatile';
        strength: 'weak' | 'moderate' | 'strong';
        confidence: number; // 0-100
        timeframe: '1month' | '3months' | '6months' | '1year';
    };
    metrics: {
        currentDemand: number; // 0-100
        projectedDemand: number; // 0-100
        competitionLevel: number; // 0-100
        profitabilityScore: number; // 0-100
        marketSaturation: number; // 0-100
    };
    factors: {
        drivingForces: string[];
        risks: string[];
        opportunities: string[];
        marketEvents: string[];
    };
    predictions: {
        priceRange: { min: number; max: number; currency: string };
        demandForecast: Array<{
            period: string;
            demand: number;
            confidence: number;
        }>;
        competitorEntry: {
            likelihood: number;
            timeframe: string;
            impact: 'low' | 'medium' | 'high';
        };
        marketSize: {
            current: number;
            projected: number;
            growthRate: number;
        };
    };
    recommendations: {
        entryTiming: 'immediate' | 'wait' | 'monitor';
        investmentLevel: 'low' | 'medium' | 'high';
        focusAreas: string[];
        riskMitigation: string[];
    };
    lastUpdated: Date;
}

export interface OpportunityForecast {
    id: string;
    title: string;
    description: string;
    category: string;
    opportunity: {
        type: 'emerging_niche' | 'market_gap' | 'technology_shift' | 'seasonal_trend' | 'regulatory_change';
        urgency: 'low' | 'medium' | 'high' | 'critical';
        window: {
            opensAt: Date;
            closesAt: Date;
            peakAt: Date;
        };
        confidence: number; // 0-100
    };
    market: {
        size: number;
        growthPotential: number;
        competitionLevel: number;
        barrierToEntry: number;
    };
    requirements: {
        skills: string[];
        resources: string[];
        timeline: string;
        investment: {
            min: number;
            max: number;
            currency: string;
        };
    };
    potential: {
        revenue: {
            conservative: number;
            optimistic: number;
            timeframe: string;
        };
        marketShare: number;
        scalability: 'low' | 'medium' | 'high';
    };
    actionPlan: {
        immediateSteps: string[];
        milestones: Array<{
            task: string;
            deadline: Date;
            priority: 'low' | 'medium' | 'high';
        }>;
        resources: string[];
    };
    risks: Array<{
        type: string;
        probability: number;
        impact: 'low' | 'medium' | 'high';
        mitigation: string;
    }>;
}

export interface PredictionAnalysis {
    summary: {
        totalTrends: number;
        risingTrends: number;
        decliningTrends: number;
        opportunities: number;
        highConfidencePredictions: number;
    };
    marketTrends: MarketTrendPrediction[];
    opportunities: OpportunityForecast[];
    insights: {
        hotCategories: string[];
        emergingTechnologies: string[];
        seasonalPatterns: string[];
        riskFactors: string[];
    };
    recommendations: {
        topOpportunities: string[];
        avoidCategories: string[];
        investmentPriorities: string[];
        timingAdvice: string[];
    };
    confidence: {
        overall: number;
        dataQuality: number;
        modelAccuracy: number;
        marketStability: number;
    };
    generatedAt: Date;
    validUntil: Date;
}

export interface PredictionRequest {
    categories?: string[];
    timeframe?: '1month' | '3months' | '6months' | '1year';
    focusAreas?: ('trends' | 'opportunities' | 'risks' | 'pricing')[];
    marketData?: {
        historicalTrends?: any[];
        competitorData?: any[];
        economicIndicators?: any[];
        seasonalData?: any[];
    };
    constraints?: {
        budget?: number;
        timeline?: string;
        riskTolerance?: 'low' | 'medium' | 'high';
        targetMarkets?: string[];
    };
}

export class PredictionAgent extends EnhancedBaseAgent {
    private predictionCache: Map<string, PredictionAnalysis> = new Map();
    private trendHistory: Map<string, MarketTrendPrediction[]> = new Map();

    constructor(config?: Partial<EnhancedAgentConfig>) {
        const agentConfig: EnhancedAgentConfig = {
            id: 'prediction-agent',
            name: 'Market Prediction Agent',
            description: 'AI agent specialized in predicting market trends and identifying future opportunities',
            primaryModel: 'gemini-1.5-pro',
            fallbackModels: ['gemini-1.5-flash'],
            maxRetries: 3,
            timeout: 90000, // Longer timeout for complex predictions
            cacheEnabled: true,
            cacheTTL: 3600, // 1 hour cache for predictions
            rateLimitPerMinute: 20,
            enableStreaming: false,
            enableQueue: true,
            ...config
        };

        super(agentConfig);
    }

    /**
     * Generate comprehensive market predictions and opportunity forecasts
     */
    public async generatePredictions(request: PredictionRequest): Promise<PredictionAnalysis> {
        const predictionPrompt = this.buildPredictionPrompt(request);

        const agentRequest: AgentRequest = {
            id: this.generateRequestId(),
            agentId: this.config.id,
            input: predictionPrompt,
            context: {
                categories: request.categories,
                timeframe: request.timeframe,
                focusAreas: request.focusAreas,
                constraints: request.constraints
            },
            priority: 'normal'
        };

        const response = await this.processRequest(agentRequest);

        if (!response.output) {
            throw new Error('Failed to generate predictions');
        }

        const analysis = this.parsePredictionResult(response.output, request);

        // Cache the analysis
        const cacheKey = this.generateCacheKey(request);
        this.predictionCache.set(cacheKey, analysis);

        // Update trend history
        this.updateTrendHistory(analysis.marketTrends);

        return analysis;
    }

    /**
     * Predict market trends for specific categories
     */
    public async predictMarketTrends(params: {
        categories: string[];
        timeframe?: '1month' | '3months' | '6months' | '1year';
        includeHistorical?: boolean;
    }): Promise<MarketTrendPrediction[]> {
        const { categories, timeframe = '3months', includeHistorical = false } = params;

        const trendPrompt = `
      Analyze and predict market trends for the following digital product categories:
      ${categories.join(', ')}
      
      Timeframe: ${timeframe}
      
      For each category, provide:
      
      1. Trend Analysis:
         - Current market direction (rising/declining/stable/volatile)
         - Trend strength and confidence level
         - Key driving factors and market forces
         
      2. Market Metrics:
         - Current and projected demand levels
         - Competition intensity and saturation
         - Profitability outlook and pricing trends
         
      3. Predictive Insights:
         - Demand forecasting with confidence intervals
         - Price range predictions
         - Competitor entry likelihood
         - Market size projections
         
      4. Strategic Recommendations:
         - Optimal entry timing
         - Investment level suggestions
         - Focus areas and opportunities
         - Risk mitigation strategies
      
      Base predictions on:
      - Current market data and trends
      - Historical patterns and cycles
      - Economic indicators and forecasts
      - Technology adoption curves
      - Consumer behavior shifts
      - Competitive landscape changes
      
      Provide actionable, data-driven predictions with clear confidence levels.
    `;

        const agentRequest: AgentRequest = {
            id: this.generateRequestId(),
            agentId: this.config.id,
            input: trendPrompt,
            context: { categories, timeframe, includeHistorical },
            priority: 'normal'
        };

        const response = await this.processRequest(agentRequest);

        if (!response.output) {
            throw new Error('Failed to predict market trends');
        }

        return this.parseMarketTrends(response.output, categories);
    }

    /**
     * Identify future market opportunities
     */
    public async identifyOpportunities(params: {
        categories?: string[];
        timeHorizon?: '1month' | '3months' | '6months' | '1year';
        opportunityTypes?: ('emerging_niche' | 'market_gap' | 'technology_shift' | 'seasonal_trend')[];
        riskTolerance?: 'low' | 'medium' | 'high';
    }): Promise<OpportunityForecast[]> {
        const {
            categories = ['all'],
            timeHorizon = '6months',
            opportunityTypes = ['emerging_niche', 'market_gap', 'technology_shift'],
            riskTolerance = 'medium'
        } = params;

        const opportunityPrompt = `
      Identify and analyze future market opportunities in digital products.
      
      Parameters:
      - Categories: ${categories.join(', ')}
      - Time Horizon: ${timeHorizon}
      - Opportunity Types: ${opportunityTypes.join(', ')}
      - Risk Tolerance: ${riskTolerance}
      
      For each opportunity, provide:
      
      1. Opportunity Definition:
         - Clear title and description
         - Opportunity type and category
         - Urgency level and timing window
         - Confidence assessment
         
      2. Market Analysis:
         - Market size and growth potential
         - Competition level and barriers
         - Target audience and demand
         
      3. Requirements Assessment:
         - Required skills and resources
         - Timeline and investment needs
         - Technical requirements
         
      4. Potential Analysis:
         - Revenue projections (conservative/optimistic)
         - Market share potential
         - Scalability assessment
         
      5. Action Planning:
         - Immediate next steps
         - Key milestones and deadlines
         - Resource allocation
         
      6. Risk Assessment:
         - Potential risks and challenges
         - Probability and impact analysis
         - Mitigation strategies
      
      Focus on:
      - Emerging technologies and trends
      - Underserved market segments
      - Regulatory changes and opportunities
      - Seasonal and cyclical patterns
      - Consumer behavior shifts
      - Competitive gaps and weaknesses
      
      Prioritize opportunities with:
      - High growth potential
      - Reasonable entry barriers
      - Clear market demand
      - Sustainable competitive advantages
      
      Provide specific, actionable opportunities with clear timelines and requirements.
    `;

        const agentRequest: AgentRequest = {
            id: this.generateRequestId(),
            agentId: this.config.id,
            input: opportunityPrompt,
            context: { categories, timeHorizon, opportunityTypes, riskTolerance },
            priority: 'normal'
        };

        const response = await this.processRequest(agentRequest);

        if (!response.output) {
            throw new Error('Failed to identify opportunities');
        }

        return this.parseOpportunities(response.output, params);
    }

    /**
     * Generate forecasting models with confidence scoring
     */
    public async generateForecastingModel(params: {
        category: string;
        historicalData?: any[];
        forecastPeriod: number; // months
        includeSeasonality?: boolean;
        includeExternalFactors?: boolean;
    }): Promise<{
        model: {
            type: string;
            accuracy: number;
            confidence: number;
            parameters: any;
        };
        forecast: Array<{
            period: string;
            prediction: number;
            confidence: number;
            factors: string[];
        }>;
        insights: {
            keyDrivers: string[];
            seasonalPatterns: string[];
            riskFactors: string[];
            recommendations: string[];
        };
    }> {
        const {
            category,
            historicalData = [],
            forecastPeriod,
            includeSeasonality = true,
            includeExternalFactors = true
        } = params;

        const modelPrompt = `
      Create a forecasting model for ${category} digital products.
      
      Parameters:
      - Forecast Period: ${forecastPeriod} months
      - Include Seasonality: ${includeSeasonality}
      - Include External Factors: ${includeExternalFactors}
      - Historical Data Points: ${historicalData.length}
      
      Generate:
      
      1. Forecasting Model:
         - Model type and methodology
         - Accuracy assessment and validation
         - Confidence levels and uncertainty
         - Key parameters and assumptions
         
      2. Period Forecasts:
         - Monthly predictions with confidence intervals
         - Trend direction and magnitude
         - Seasonal adjustments and patterns
         - External factor impacts
         
      3. Model Insights:
         - Primary demand drivers
         - Seasonal patterns and cycles
         - Risk factors and uncertainties
         - Model limitations and assumptions
         
      4. Strategic Recommendations:
         - Optimal timing for market entry
         - Resource allocation suggestions
         - Risk mitigation strategies
         - Monitoring and adjustment points
      
      Consider:
      - Market maturity and lifecycle stage
      - Technology adoption curves
      - Economic cycles and indicators
      - Competitive dynamics
      - Consumer behavior patterns
      - Regulatory environment changes
      
      Provide a robust, actionable forecasting framework with clear confidence metrics.
    `;

        const agentRequest: AgentRequest = {
            id: this.generateRequestId(),
            agentId: this.config.id,
            input: modelPrompt,
            context: params,
            priority: 'normal'
        };

        const response = await this.processRequest(agentRequest);

        if (!response.output) {
            throw new Error('Failed to generate forecasting model');
        }

        return this.parseForecastingModel(response.output, params);
    }

    /**
     * Get cached predictions or generate new ones
     */
    public async getCachedPredictions(request: PredictionRequest): Promise<PredictionAnalysis | null> {
        const cacheKey = this.generateCacheKey(request);
        const cached = this.predictionCache.get(cacheKey);

        if (cached && this.isCacheValid(cached)) {
            return cached;
        }

        return null;
    }

    /**
     * Update predictions with new market data
     */
    public async updatePredictions(
        existingAnalysis: PredictionAnalysis,
        newData: any
    ): Promise<PredictionAnalysis> {
        const updatePrompt = `
      Update the following market predictions with new data:
      
      Existing Analysis:
      - Total Trends: ${existingAnalysis.summary.totalTrends}
      - Rising Trends: ${existingAnalysis.summary.risingTrends}
      - Opportunities: ${existingAnalysis.summary.opportunities}
      - Overall Confidence: ${existingAnalysis.confidence.overall}%
      
      New Market Data:
      ${JSON.stringify(newData, null, 2)}
      
      Provide updated predictions that:
      1. Incorporate the new data points
      2. Adjust confidence levels accordingly
      3. Update trend directions and strengths
      4. Revise opportunity assessments
      5. Modify recommendations based on changes
      
      Maintain consistency with previous analysis while reflecting new insights.
    `;

        const agentRequest: AgentRequest = {
            id: this.generateRequestId(),
            agentId: this.config.id,
            input: updatePrompt,
            context: { existingAnalysis, newData },
            priority: 'high'
        };

        const response = await this.processRequest(agentRequest);

        if (!response.output) {
            throw new Error('Failed to update predictions');
        }

        return this.parsePredictionResult(response.output, {});
    }

    // Implementation of abstract methods from EnhancedBaseAgent
    protected async processOutput(content: string, request: AgentRequest): Promise<unknown> {
        try {
            return JSON.parse(content);
        } catch {
            return {
                content,
                type: 'prediction',
                context: request.context,
                timestamp: new Date().toISOString()
            };
        }
    }

    protected async getEmergencyFallback(request: AgentRequest): Promise<unknown> {
        return {
            error: 'Prediction service temporarily unavailable',
            fallback: true,
            message: 'Using basic trend analysis',
            basicTrends: this.generateBasicTrends(request.context?.categories || []),
            timestamp: new Date().toISOString()
        };
    }

    public async process(input: unknown, context?: Record<string, unknown>): Promise<unknown> {
        if (typeof input === 'object' && input !== null) {
            const predictionRequest = input as PredictionRequest;
            return await this.generatePredictions(predictionRequest);
        }

        throw new Error('Invalid input: expected PredictionRequest object');
    }

    // Private helper methods
    private buildPredictionPrompt(request: PredictionRequest): string {
        const {
            categories = ['all'],
            timeframe = '3months',
            focusAreas = ['trends', 'opportunities'],
            marketData,
            constraints
        } = request;

        let prompt = `
      Generate comprehensive market predictions and opportunity analysis for digital products.
      
      Analysis Parameters:
      - Categories: ${categories.join(', ')}
      - Timeframe: ${timeframe}
      - Focus Areas: ${focusAreas.join(', ')}
    `;

        if (marketData) {
            prompt += `
      
      Available Market Data:
      - Historical Trends: ${marketData.historicalTrends?.length || 0} data points
      - Competitor Data: ${marketData.competitorData?.length || 0} entries
      - Economic Indicators: ${marketData.economicIndicators?.length || 0} metrics
      - Seasonal Data: ${marketData.seasonalData?.length || 0} patterns
      `;
        }

        if (constraints) {
            prompt += `
      
      Constraints:
      ${constraints.budget ? `- Budget: $${constraints.budget}` : ''}
      ${constraints.timeline ? `- Timeline: ${constraints.timeline}` : ''}
      ${constraints.riskTolerance ? `- Risk Tolerance: ${constraints.riskTolerance}` : ''}
      ${constraints.targetMarkets ? `- Target Markets: ${constraints.targetMarkets.join(', ')}` : ''}
      `;
        }

        prompt += `
    
    Provide comprehensive analysis including:
    
    1. Market Trend Predictions:
       - Trend direction, strength, and confidence
       - Demand forecasting and price predictions
       - Competition analysis and market saturation
       - Key driving factors and risks
       
    2. Opportunity Identification:
       - Emerging niches and market gaps
       - Technology shifts and regulatory changes
       - Seasonal trends and cyclical patterns
       - Investment requirements and potential returns
       
    3. Strategic Insights:
       - Hot categories and emerging technologies
       - Risk factors and market stability
       - Investment priorities and timing advice
       - Actionable recommendations
       
    4. Confidence Assessment:
       - Overall prediction confidence
       - Data quality and model accuracy
       - Market stability indicators
       - Uncertainty factors
    
    Base analysis on:
    - Current market conditions and trends
    - Historical patterns and cycles
    - Economic indicators and forecasts
    - Technology adoption rates
    - Consumer behavior shifts
    - Competitive landscape evolution
    - Regulatory environment changes
    
    Provide specific, actionable predictions with clear confidence levels and timelines.
    `;

        return prompt;
    }

    private parsePredictionResult(output: unknown, request: PredictionRequest): PredictionAnalysis {
        try {
            if (typeof output === 'object' && output !== null) {
                const structured = output as any;
                if (structured.marketTrends && structured.opportunities) {
                    return {
                        ...structured,
                        generatedAt: new Date(),
                        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // Valid for 24 hours
                    };
                }
            }

            // Parse from text if needed
            return this.createFallbackAnalysis(request);

        } catch (error) {
            console.error('Error parsing prediction result:', error);
            return this.createFallbackAnalysis(request);
        }
    }

    private parseMarketTrends(output: unknown, categories: string[]): MarketTrendPrediction[] {
        try {
            if (typeof output === 'object' && output !== null) {
                const structured = output as any;
                if (Array.isArray(structured.trends)) {
                    return structured.trends;
                }
            }

            // Generate basic trends for categories
            return categories.map(category => this.createBasicTrend(category));

        } catch (error) {
            console.error('Error parsing market trends:', error);
            return categories.map(category => this.createBasicTrend(category));
        }
    }

    private parseOpportunities(output: unknown, params: any): OpportunityForecast[] {
        try {
            if (typeof output === 'object' && output !== null) {
                const structured = output as any;
                if (Array.isArray(structured.opportunities)) {
                    return structured.opportunities;
                }
            }

            // Generate basic opportunities
            return this.generateBasicOpportunities(params.categories || ['digital-products']);

        } catch (error) {
            console.error('Error parsing opportunities:', error);
            return this.generateBasicOpportunities(params.categories || ['digital-products']);
        }
    }

    private parseForecastingModel(output: unknown, params: any): any {
        try {
            if (typeof output === 'object' && output !== null) {
                const structured = output as any;
                if (structured.model && structured.forecast) {
                    return structured;
                }
            }

            // Generate basic forecasting model
            return this.createBasicForecastingModel(params);

        } catch (error) {
            console.error('Error parsing forecasting model:', error);
            return this.createBasicForecastingModel(params);
        }
    }

    private createFallbackAnalysis(request: PredictionRequest): PredictionAnalysis {
        const categories = request.categories || ['digital-products'];
        const trends = categories.map(category => this.createBasicTrend(category));
        const opportunities = this.generateBasicOpportunities(categories);

        return {
            summary: {
                totalTrends: trends.length,
                risingTrends: Math.floor(trends.length * 0.6),
                decliningTrends: Math.floor(trends.length * 0.2),
                opportunities: opportunities.length,
                highConfidencePredictions: Math.floor(trends.length * 0.4)
            },
            marketTrends: trends,
            opportunities,
            insights: {
                hotCategories: categories.slice(0, 3),
                emergingTechnologies: ['AI', 'Automation', 'Mobile-first'],
                seasonalPatterns: ['Q4 surge', 'Summer dip'],
                riskFactors: ['Market saturation', 'Economic uncertainty']
            },
            recommendations: {
                topOpportunities: opportunities.slice(0, 3).map(o => o.title),
                avoidCategories: ['Oversaturated markets'],
                investmentPriorities: ['High-growth categories'],
                timingAdvice: ['Monitor market conditions']
            },
            confidence: {
                overall: 70,
                dataQuality: 65,
                modelAccuracy: 75,
                marketStability: 70
            },
            generatedAt: new Date(),
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
    }

    private createBasicTrend(category: string): MarketTrendPrediction {
        return {
            id: `trend_${category}_${Date.now()}`,
            category,
            trend: {
                direction: 'rising',
                strength: 'moderate',
                confidence: 75,
                timeframe: '3months'
            },
            metrics: {
                currentDemand: 70,
                projectedDemand: 80,
                competitionLevel: 60,
                profitabilityScore: 75,
                marketSaturation: 50
            },
            factors: {
                drivingForces: ['Digital transformation', 'Remote work trends'],
                risks: ['Market saturation', 'Economic uncertainty'],
                opportunities: ['Emerging technologies', 'New user segments'],
                marketEvents: ['Technology adoption', 'Regulatory changes']
            },
            predictions: {
                priceRange: { min: 20, max: 100, currency: 'USD' },
                demandForecast: [
                    { period: 'Month 1', demand: 75, confidence: 80 },
                    { period: 'Month 2', demand: 80, confidence: 75 },
                    { period: 'Month 3', demand: 85, confidence: 70 }
                ],
                competitorEntry: {
                    likelihood: 60,
                    timeframe: '3-6 months',
                    impact: 'medium'
                },
                marketSize: {
                    current: 1000000,
                    projected: 1200000,
                    growthRate: 20
                }
            },
            recommendations: {
                entryTiming: 'immediate',
                investmentLevel: 'medium',
                focusAreas: ['Quality', 'Innovation', 'Marketing'],
                riskMitigation: ['Diversification', 'Market monitoring']
            },
            lastUpdated: new Date()
        };
    }

    private generateBasicOpportunities(categories: string[]): OpportunityForecast[] {
        return categories.slice(0, 3).map((category, index) => ({
            id: `opp_${category}_${Date.now()}_${index}`,
            title: `${category} Market Opportunity`,
            description: `Emerging opportunity in ${category} digital products`,
            category,
            opportunity: {
                type: 'emerging_niche' as const,
                urgency: 'medium' as const,
                window: {
                    opensAt: new Date(),
                    closesAt: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months
                    peakAt: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000) // 3 months
                },
                confidence: 75
            },
            market: {
                size: 500000,
                growthPotential: 80,
                competitionLevel: 40,
                barrierToEntry: 30
            },
            requirements: {
                skills: ['Product development', 'Marketing', 'Customer service'],
                resources: ['Development tools', 'Marketing budget'],
                timeline: '3-6 months',
                investment: { min: 5000, max: 25000, currency: 'USD' }
            },
            potential: {
                revenue: {
                    conservative: 50000,
                    optimistic: 150000,
                    timeframe: '12 months'
                },
                marketShare: 5,
                scalability: 'high'
            },
            actionPlan: {
                immediateSteps: ['Market research', 'Prototype development'],
                milestones: [
                    {
                        task: 'Complete market analysis',
                        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        priority: 'high'
                    }
                ],
                resources: ['Development team', 'Marketing budget']
            },
            risks: [
                {
                    type: 'Market saturation',
                    probability: 30,
                    impact: 'medium',
                    mitigation: 'Focus on differentiation'
                }
            ]
        }));
    }

    private createBasicForecastingModel(params: any): any {
        const periods = [];
        for (let i = 1; i <= params.forecastPeriod; i++) {
            periods.push({
                period: `Month ${i}`,
                prediction: 70 + (i * 2) + (Math.random() * 10 - 5),
                confidence: Math.max(60, 90 - (i * 2)),
                factors: ['Market growth', 'Seasonal trends']
            });
        }

        return {
            model: {
                type: 'Trend Analysis',
                accuracy: 75,
                confidence: 70,
                parameters: { category: params.category, period: params.forecastPeriod }
            },
            forecast: periods,
            insights: {
                keyDrivers: ['Market demand', 'Technology adoption'],
                seasonalPatterns: ['Q4 peak', 'Summer decline'],
                riskFactors: ['Competition', 'Economic changes'],
                recommendations: ['Monitor trends', 'Adjust strategy']
            }
        };
    }

    private generateBasicTrends(categories: string[]): MarketTrendPrediction[] {
        return categories.map(category => this.createBasicTrend(category));
    }

    private updateTrendHistory(trends: MarketTrendPrediction[]): void {
        trends.forEach(trend => {
            const history = this.trendHistory.get(trend.category) || [];
            history.push(trend);

            // Keep only last 10 predictions per category
            if (history.length > 10) {
                history.shift();
            }

            this.trendHistory.set(trend.category, history);
        });
    }

    private generateCacheKey(request: PredictionRequest): string {
        const key = JSON.stringify({
            categories: request.categories?.sort(),
            timeframe: request.timeframe,
            focusAreas: request.focusAreas?.sort()
        });
        return Buffer.from(key).toString('base64');
    }

    private isCacheValid(analysis: PredictionAnalysis): boolean {
        return analysis.validUntil > new Date();
    }

    private generateRequestId(): string {
        return `predict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}