import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AnalysisAgent } from '../analysis-agent';
import type { ProductAnalysisRequest } from '../analysis-agent';

// Set environment variables for tests
process.env.GOOGLE_AI_API_KEY = 'test-google-key';

// Mock the Google AI client
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
            generateContent: vi.fn().mockResolvedValue({
                response: {
                    text: () => JSON.stringify({
                        scores: {
                            marketViability: 85,
                            competitiveAdvantage: 70,
                            pricingOptimization: 80,
                            featureCompleteness: 75,
                            marketTiming: 90,
                            overallScore: 80
                        },
                        marketPositioning: {
                            position: 'challenger',
                            strengths: ['Innovative features', 'Competitive pricing'],
                            weaknesses: ['Limited market presence'],
                            opportunities: ['Growing market demand'],
                            threats: ['Established competitors']
                        },
                        competitiveAnalysis: {
                            directCompetitors: [],
                            marketGaps: ['Mobile optimization'],
                            differentiationOpportunities: ['AI integration']
                        },
                        trendAnalysis: {
                            currentTrends: [],
                            emergingOpportunities: ['AI-powered features'],
                            riskFactors: ['Market saturation']
                        },
                        recommendations: [{
                            category: 'features',
                            priority: 'high',
                            action: 'Add AI-powered analytics',
                            expectedImpact: 'Increased user engagement',
                            implementation: {
                                difficulty: 'medium',
                                timeframe: 'short-term',
                                resources: ['Development team']
                            }
                        }],
                        confidence: 85
                    })
                }
            })
        })
    }))
}));

describe('AnalysisAgent', () => {
    let analysisAgent: AnalysisAgent;

    beforeEach(() => {
        vi.clearAllMocks();

        analysisAgent = new AnalysisAgent({
            timeout: 10000,
            maxRetries: 2,
            cacheEnabled: false // Disable cache for testing
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('analyzeProduct', () => {
        it('should successfully analyze a product', async () => {
            const request: ProductAnalysisRequest = {
                productData: {
                    title: 'AI-Powered Analytics Dashboard',
                    description: 'A comprehensive analytics dashboard with AI insights for businesses',
                    pricing: {
                        amount: 99,
                        currency: 'USD',
                        type: 'subscription'
                    },
                    features: ['Real-time analytics', 'AI insights', 'Custom dashboards'],
                    category: 'saas',
                    source: 'Product Hunt'
                },
                analysisType: 'comprehensive'
            };

            const result = await analysisAgent.analyzeProduct(request);

            expect(result).toBeDefined();
            expect(result.productId).toBeDefined();
            expect(result.analysisType).toBe('comprehensive');
            expect(result.scores).toBeDefined();
            expect(result.scores.overallScore).toBeGreaterThan(0);
            expect(result.scores.overallScore).toBeLessThanOrEqual(100);
            expect(result.marketPositioning).toBeDefined();
            expect(result.marketPositioning.position).toMatch(/leader|challenger|follower|niche/);
            expect(result.recommendations).toBeDefined();
            expect(Array.isArray(result.recommendations)).toBe(true);
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.confidence).toBeLessThanOrEqual(100);
            expect(result.analysisDate).toBeInstanceOf(Date);
        });

        it('should handle competitive analysis type', async () => {
            const request: ProductAnalysisRequest = {
                productData: {
                    title: 'Project Management Tool',
                    description: 'Streamlined project management for teams',
                    pricing: {
                        amount: 15,
                        currency: 'USD',
                        type: 'subscription'
                    },
                    category: 'productivity'
                },
                competitorData: [
                    {
                        title: 'Competitor A',
                        pricing: 20,
                        features: ['Task management', 'Team collaboration'],
                        source: 'Market research'
                    },
                    {
                        title: 'Competitor B',
                        pricing: 12,
                        features: ['Gantt charts', 'Time tracking'],
                        source: 'Market research'
                    }
                ],
                analysisType: 'competitive'
            };

            const result = await analysisAgent.analyzeProduct(request);

            expect(result).toBeDefined();
            expect(result.analysisType).toBe('competitive');
            expect(result.competitiveAnalysis).toBeDefined();
        });

        it('should include market context when provided', async () => {
            const request: ProductAnalysisRequest = {
                productData: {
                    title: 'E-learning Platform',
                    description: 'Online learning platform with interactive courses',
                    category: 'education'
                },
                marketContext: {
                    category: 'education',
                    trends: ['Remote learning', 'Microlearning'],
                    averagePrice: 50,
                    competitorCount: 25
                },
                analysisType: 'market-positioning'
            };

            const result = await analysisAgent.analyzeProduct(request);

            expect(result).toBeDefined();
            expect(result.analysisType).toBe('market-positioning');
            expect(result.trendAnalysis).toBeDefined();
        });

        it('should handle missing optional fields gracefully', async () => {
            const request: ProductAnalysisRequest = {
                productData: {
                    title: 'Simple Tool',
                    description: 'A basic productivity tool'
                },
                analysisType: 'comprehensive'
            };

            const result = await analysisAgent.analyzeProduct(request);

            expect(result).toBeDefined();
            expect(result.productId).toBeDefined();
            expect(result.scores).toBeDefined();
        });
    });

    describe('detectTrends', () => {
        it('should detect trends with default parameters', async () => {
            const result = await analysisAgent.detectTrends({});

            expect(result).toBeDefined();
            expect(result.trends).toBeDefined();
            expect(Array.isArray(result.trends)).toBe(true);
            expect(result.insights).toBeDefined();
            expect(result.insights.hotCategories).toBeDefined();
            expect(result.insights.emergingNiches).toBeDefined();
            expect(result.predictions).toBeDefined();
            expect(Array.isArray(result.predictions)).toBe(true);
        });

        it('should detect trends for specific categories', async () => {
            const result = await analysisAgent.detectTrends({
                categories: ['ai', 'saas', 'productivity'],
                timeframe: 'quarter',
                includeEmergingTrends: true
            });

            expect(result).toBeDefined();
            expect(result.trends).toBeDefined();
            expect(result.insights).toBeDefined();
        });

        it('should handle different timeframes', async () => {
            const timeframes: Array<'week' | 'month' | 'quarter' | 'year'> = ['week', 'month', 'quarter', 'year'];

            for (const timeframe of timeframes) {
                const result = await analysisAgent.detectTrends({ timeframe });
                expect(result).toBeDefined();
                expect(result.trends).toBeDefined();
            }
        });
    });

    describe('analyzeCompetitiveLandscape', () => {
        it('should analyze competitive landscape', async () => {
            const result = await analysisAgent.analyzeCompetitiveLandscape({
                productCategory: 'project-management',
                targetProduct: {
                    name: 'TaskFlow',
                    features: ['Task management', 'Team collaboration', 'Time tracking'],
                    pricing: 25
                },
                competitors: [
                    {
                        name: 'Asana',
                        features: ['Task management', 'Project templates', 'Team collaboration'],
                        pricing: 30,
                        marketShare: 15
                    },
                    {
                        name: 'Trello',
                        features: ['Kanban boards', 'Card management', 'Team collaboration'],
                        pricing: 20,
                        marketShare: 20
                    }
                ],
                marketSize: 5000000000 // $5B market
            });

            expect(result).toBeDefined();
            expect(result.landscape).toBeDefined();
            expect(result.landscape.marketLeaders).toBeDefined();
            expect(result.landscape.challengers).toBeDefined();
            expect(result.landscape.niches).toBeDefined();
            expect(result.opportunities).toBeDefined();
            expect(Array.isArray(result.opportunities)).toBe(true);
            expect(result.recommendations).toBeDefined();
            expect(Array.isArray(result.recommendations)).toBe(true);
        });

        it('should handle minimal input', async () => {
            const result = await analysisAgent.analyzeCompetitiveLandscape({
                productCategory: 'design-tools'
            });

            expect(result).toBeDefined();
            expect(result.landscape).toBeDefined();
            expect(result.opportunities).toBeDefined();
            expect(result.recommendations).toBeDefined();
        });
    });

    describe('generateRecommendations', () => {
        it('should generate recommendations from analysis results', async () => {
            // First create some analysis results
            const analysisRequest: ProductAnalysisRequest = {
                productData: {
                    title: 'Marketing Automation Tool',
                    description: 'Automated marketing campaigns and analytics',
                    pricing: { amount: 199, currency: 'USD', type: 'subscription' },
                    category: 'marketing'
                },
                analysisType: 'comprehensive'
            };

            const analysisResult = await analysisAgent.analyzeProduct(analysisRequest);

            const result = await analysisAgent.generateRecommendations({
                analysisResults: [analysisResult],
                userGoals: {
                    revenue: 1000000,
                    timeframe: '12 months',
                    riskTolerance: 'medium',
                    resources: ['Development team', 'Marketing budget']
                },
                marketConstraints: {
                    budget: 500000,
                    timeline: '6 months',
                    teamSize: 10
                }
            });

            expect(result).toBeDefined();
            expect(result.recommendations).toBeDefined();
            expect(Array.isArray(result.recommendations)).toBe(true);
            expect(result.strategy).toBeDefined();
            expect(result.strategy.shortTerm).toBeDefined();
            expect(result.strategy.mediumTerm).toBeDefined();
            expect(result.strategy.longTerm).toBeDefined();
            expect(result.riskMitigation).toBeDefined();
            expect(Array.isArray(result.riskMitigation)).toBe(true);
        });

        it('should handle empty analysis results', async () => {
            const result = await analysisAgent.generateRecommendations({
                analysisResults: []
            });

            expect(result).toBeDefined();
            expect(result.recommendations).toBeDefined();
            expect(result.strategy).toBeDefined();
            expect(result.riskMitigation).toBeDefined();
        });
    });

    describe('process method (EnhancedBaseAgent interface)', () => {
        it('should process ProductAnalysisRequest correctly', async () => {
            const request: ProductAnalysisRequest = {
                productData: {
                    title: 'Test Product',
                    description: 'A test product for analysis'
                },
                analysisType: 'comprehensive'
            };

            const result = await analysisAgent.process(request);

            expect(result).toBeDefined();
            expect(typeof result === 'object').toBe(true);
        });

        it('should reject invalid input', async () => {
            await expect(analysisAgent.process('invalid input'))
                .rejects.toThrow('Invalid input: expected ProductAnalysisRequest object');
        });

        it('should reject null input', async () => {
            await expect(analysisAgent.process(null))
                .rejects.toThrow('Invalid input: expected ProductAnalysisRequest object');
        });
    });

    describe('error handling', () => {
        it('should handle AI service failures gracefully', async () => {
            // Mock AI service failure
            const failingAgent = new AnalysisAgent({
                timeout: 1, // Very short timeout to force failure
                maxRetries: 1
            });

            const request: ProductAnalysisRequest = {
                productData: {
                    title: 'Test Product',
                    description: 'Test description'
                },
                analysisType: 'comprehensive'
            };

            // Should not throw, but return fallback result
            const result = await failingAgent.analyzeProduct(request);
            expect(result).toBeDefined();
            expect(result.confidence).toBeLessThanOrEqual(70); // Fallback should have lower confidence
        });

        it('should validate analysis types', async () => {
            const request = {
                productData: {
                    title: 'Test Product',
                    description: 'Test description'
                },
                analysisType: 'invalid-type' as any
            };

            // Should handle invalid analysis type gracefully
            const result = await analysisAgent.analyzeProduct(request);
            expect(result).toBeDefined();
        });
    });

    describe('caching behavior', () => {
        it('should use cache when enabled', async () => {
            const cachedAgent = new AnalysisAgent({
                cacheEnabled: true,
                cacheTTL: 3600
            });

            const request: ProductAnalysisRequest = {
                productData: {
                    title: 'Cached Product',
                    description: 'Product for cache testing'
                },
                analysisType: 'comprehensive'
            };

            // First call
            const result1 = await cachedAgent.analyzeProduct(request);

            // Second call should potentially use cache
            const result2 = await cachedAgent.analyzeProduct(request);

            expect(result1).toBeDefined();
            expect(result2).toBeDefined();
            expect(result1.productId).toBe(result2.productId);
        });
    });
});