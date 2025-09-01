import { describe, it, expect, beforeEach } from 'vitest';
import { PredictionAgent } from '../prediction-agent';
import type { PredictionRequest } from '../prediction-agent';

// Set environment variables for tests
process.env.GOOGLE_AI_API_KEY = 'test-google-key';

describe('PredictionAgent', () => {
    let predictionAgent: PredictionAgent;

    beforeEach(() => {
        predictionAgent = new PredictionAgent();
    });

    describe('generatePredictions', () => {
        it('should generate comprehensive market predictions', async () => {
            const request: PredictionRequest = {
                categories: ['software', 'courses'],
                timeframe: '3months',
                focusAreas: ['trends', 'opportunities'],
                constraints: {
                    budget: 10000,
                    riskTolerance: 'medium'
                }
            };

            const analysis = await predictionAgent.generatePredictions(request);

            expect(analysis).toBeDefined();
            expect(analysis.summary).toBeDefined();
            expect(analysis.marketTrends).toBeDefined();
            expect(analysis.opportunities).toBeDefined();
            expect(analysis.insights).toBeDefined();
            expect(analysis.recommendations).toBeDefined();
            expect(analysis.confidence).toBeDefined();
            expect(analysis.generatedAt).toBeInstanceOf(Date);
            expect(analysis.validUntil).toBeInstanceOf(Date);
        });

        it('should handle minimal prediction request', async () => {
            const request: PredictionRequest = {
                categories: ['template']
            };

            const analysis = await predictionAgent.generatePredictions(request);

            expect(analysis).toBeDefined();
            expect(analysis.summary.totalTrends).toBeGreaterThan(0);
            expect(analysis.marketTrends.length).toBeGreaterThan(0);
            expect(analysis.confidence.overall).toBeGreaterThan(0);
        });
    });

    describe('predictMarketTrends', () => {
        it('should predict trends for specific categories', async () => {
            const params = {
                categories: ['ebook', 'software', 'course'],
                timeframe: '6months' as const,
                includeHistorical: true
            };

            const trends = await predictionAgent.predictMarketTrends(params);

            expect(trends).toBeDefined();
            expect(Array.isArray(trends)).toBe(true);
            expect(trends.length).toBe(3);

            trends.forEach(trend => {
                expect(trend.id).toBeDefined();
                expect(trend.category).toBeDefined();
                expect(trend.trend.direction).toMatch(/^(rising|declining|stable|volatile)$/);
                expect(trend.trend.strength).toMatch(/^(weak|moderate|strong)$/);
                expect(trend.trend.confidence).toBeGreaterThanOrEqual(0);
                expect(trend.trend.confidence).toBeLessThanOrEqual(100);
                expect(trend.metrics).toBeDefined();
                expect(trend.factors).toBeDefined();
                expect(trend.predictions).toBeDefined();
                expect(trend.recommendations).toBeDefined();
            });
        });

        it('should handle single category prediction', async () => {
            const params = {
                categories: ['saas'],
                timeframe: '1month' as const
            };

            const trends = await predictionAgent.predictMarketTrends(params);

            expect(trends).toBeDefined();
            expect(trends.length).toBe(1);
            expect(trends[0].category).toBe('saas');
            expect(trends[0].trend.timeframe).toBe('1month');
        });
    });

    describe('identifyOpportunities', () => {
        it('should identify market opportunities', async () => {
            const params = {
                categories: ['ai', 'productivity'],
                timeHorizon: '6months' as const,
                opportunityTypes: ['emerging_niche', 'market_gap'] as const,
                riskTolerance: 'high' as const
            };

            const opportunities = await predictionAgent.identifyOpportunities(params);

            expect(opportunities).toBeDefined();
            expect(Array.isArray(opportunities)).toBe(true);
            expect(opportunities.length).toBeGreaterThan(0);

            opportunities.forEach(opportunity => {
                expect(opportunity.id).toBeDefined();
                expect(opportunity.title).toBeDefined();
                expect(opportunity.description).toBeDefined();
                expect(opportunity.category).toBeDefined();
                expect(opportunity.opportunity.type).toMatch(/^(emerging_niche|market_gap|technology_shift|seasonal_trend|regulatory_change)$/);
                expect(opportunity.opportunity.urgency).toMatch(/^(low|medium|high|critical)$/);
                expect(opportunity.opportunity.confidence).toBeGreaterThanOrEqual(0);
                expect(opportunity.opportunity.confidence).toBeLessThanOrEqual(100);
                expect(opportunity.market).toBeDefined();
                expect(opportunity.requirements).toBeDefined();
                expect(opportunity.potential).toBeDefined();
                expect(opportunity.actionPlan).toBeDefined();
                expect(opportunity.risks).toBeDefined();
            });
        });

        it('should handle default parameters', async () => {
            const params = {};

            const opportunities = await predictionAgent.identifyOpportunities(params);

            expect(opportunities).toBeDefined();
            expect(Array.isArray(opportunities)).toBe(true);
        });
    });

    describe('generateForecastingModel', () => {
        it('should generate forecasting model for category', async () => {
            const params = {
                category: 'digital-marketing',
                forecastPeriod: 12,
                includeSeasonality: true,
                includeExternalFactors: true
            };

            const model = await predictionAgent.generateForecastingModel(params);

            expect(model).toBeDefined();
            expect(model.model).toBeDefined();
            expect(model.model.type).toBeDefined();
            expect(model.model.accuracy).toBeGreaterThanOrEqual(0);
            expect(model.model.accuracy).toBeLessThanOrEqual(100);
            expect(model.model.confidence).toBeGreaterThanOrEqual(0);
            expect(model.model.confidence).toBeLessThanOrEqual(100);

            expect(model.forecast).toBeDefined();
            expect(Array.isArray(model.forecast)).toBe(true);
            expect(model.forecast.length).toBe(12);

            model.forecast.forEach(forecast => {
                expect(forecast.period).toBeDefined();
                expect(forecast.prediction).toBeDefined();
                expect(forecast.confidence).toBeGreaterThanOrEqual(0);
                expect(forecast.confidence).toBeLessThanOrEqual(100);
                expect(forecast.factors).toBeDefined();
            });

            expect(model.insights).toBeDefined();
            expect(model.insights.keyDrivers).toBeDefined();
            expect(model.insights.seasonalPatterns).toBeDefined();
            expect(model.insights.riskFactors).toBeDefined();
            expect(model.insights.recommendations).toBeDefined();
        });

        it('should handle short forecast period', async () => {
            const params = {
                category: 'templates',
                forecastPeriod: 3,
                includeSeasonality: false,
                includeExternalFactors: false
            };

            const model = await predictionAgent.generateForecastingModel(params);

            expect(model).toBeDefined();
            expect(model.forecast.length).toBe(3);
        });
    });

    describe('cache management', () => {
        it('should handle cached predictions', async () => {
            const request: PredictionRequest = {
                categories: ['test-category'],
                timeframe: '1month'
            };

            // First call should return null (no cache)
            const cached1 = await predictionAgent.getCachedPredictions(request);
            expect(cached1).toBeNull();

            // Generate predictions
            const analysis = await predictionAgent.generatePredictions(request);
            expect(analysis).toBeDefined();

            // Second call should return cached result
            const cached2 = await predictionAgent.getCachedPredictions(request);
            expect(cached2).toBeDefined();
            expect(cached2?.generatedAt).toEqual(analysis.generatedAt);
        });
    });

    describe('helper methods', () => {
        it('should generate request ID', () => {
            const id = (predictionAgent as any).generateRequestId();
            expect(id).toMatch(/^predict_\d+_[a-z0-9]+$/);
        });

        it('should create basic trend', () => {
            const trend = (predictionAgent as any).createBasicTrend('test-category');

            expect(trend.id).toBeDefined();
            expect(trend.category).toBe('test-category');
            expect(trend.trend.direction).toBe('rising');
            expect(trend.trend.strength).toBe('moderate');
            expect(trend.trend.confidence).toBe(75);
            expect(trend.metrics).toBeDefined();
            expect(trend.factors).toBeDefined();
            expect(trend.predictions).toBeDefined();
            expect(trend.recommendations).toBeDefined();
        });

        it('should generate basic opportunities', () => {
            const opportunities = (predictionAgent as any).generateBasicOpportunities(['category1', 'category2']);

            expect(opportunities).toBeDefined();
            expect(Array.isArray(opportunities)).toBe(true);
            expect(opportunities.length).toBe(2);

            opportunities.forEach((opp: any) => {
                expect(opp.id).toBeDefined();
                expect(opp.title).toBeDefined();
                expect(opp.category).toBeDefined();
                expect(opp.opportunity).toBeDefined();
                expect(opp.market).toBeDefined();
                expect(opp.requirements).toBeDefined();
                expect(opp.potential).toBeDefined();
                expect(opp.actionPlan).toBeDefined();
                expect(opp.risks).toBeDefined();
            });
        });

        it('should create cache key', () => {
            const request: PredictionRequest = {
                categories: ['cat1', 'cat2'],
                timeframe: '3months',
                focusAreas: ['trends', 'opportunities']
            };

            const key = (predictionAgent as any).generateCacheKey(request);
            expect(typeof key).toBe('string');
            expect(key.length).toBeGreaterThan(0);
        });
    });

    describe('error handling', () => {
        it('should handle invalid prediction requests gracefully', async () => {
            const invalidRequest = {
                categories: [],
                timeframe: 'invalid' as any
            };

            const analysis = await predictionAgent.generatePredictions(invalidRequest);

            expect(analysis).toBeDefined();
            expect(analysis.summary).toBeDefined();
            expect(analysis.confidence.overall).toBeGreaterThan(0);
        });

        it('should provide fallback analysis', () => {
            const fallback = (predictionAgent as any).createFallbackAnalysis({
                categories: ['test']
            });

            expect(fallback).toBeDefined();
            expect(fallback.summary).toBeDefined();
            expect(fallback.marketTrends).toBeDefined();
            expect(fallback.opportunities).toBeDefined();
            expect(fallback.insights).toBeDefined();
            expect(fallback.recommendations).toBeDefined();
            expect(fallback.confidence).toBeDefined();
        });
    });

    describe('process method (EnhancedBaseAgent interface)', () => {
        it('should process PredictionRequest input', async () => {
            const input: PredictionRequest = {
                categories: ['test-category'],
                timeframe: '1month'
            };

            const result = await predictionAgent.process(input);

            expect(result).toBeDefined();
            expect((result as any).summary).toBeDefined();
        });

        it('should reject invalid input', async () => {
            await expect(predictionAgent.process('invalid input'))
                .rejects.toThrow('Invalid input: expected PredictionRequest object');
        });
    });
});