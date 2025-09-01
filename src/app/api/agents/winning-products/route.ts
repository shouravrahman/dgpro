import { NextRequest, NextResponse } from 'next/server';
import { ScrapingAgent } from '@/lib/scraping/scraping-agent';
import { WinningProductsAnalyzer } from '@/lib/scraping/winning-products-analyzer';
import { FacebookAdsIntelligence } from '@/lib/scraping/facebook-ads-intelligence';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schemas
const AnalysisConfigSchema = z.object({
    categories: z.array(z.string()).optional(),
    priceRange: z.object({
        min: z.number().min(0),
        max: z.number().min(1)
    }).optional(),
    sources: z.array(z.string()).optional(),
    includeAds: z.boolean().default(true),
    includeTrending: z.boolean().default(true),
    includeSaaS: z.boolean().default(true),
    timeframe: z.enum(['week', 'month', 'quarter']).default('month'),
    minTrendingScore: z.number().min(0).max(100).default(60),
    maxResults: z.number().min(1).max(100).default(50)
});

const DeepDiveSchema = z.object({
    productName: z.string().optional(),
    category: z.string().optional(),
    competitorUrls: z.array(z.string().url()).optional()
});

const MonitoringSchema = z.object({
    productIds: z.array(z.string()).min(1).max(20)
});

// Initialize analyzers
let scrapingAgent: ScrapingAgent | null = null;
let winningProductsAnalyzer: WinningProductsAnalyzer | null = null;
let facebookAdsIntel: FacebookAdsIntelligence | null = null;

function getAnalyzers() {
    if (!scrapingAgent) {
        scrapingAgent = new ScrapingAgent({
            firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
            defaultTimeout: 30000,
            maxRetries: 3,
            respectRateLimit: true
        });
    }

    if (!winningProductsAnalyzer) {
        winningProductsAnalyzer = new WinningProductsAnalyzer(scrapingAgent);
    }

    if (!facebookAdsIntel) {
        facebookAdsIntel = new FacebookAdsIntelligence(scrapingAgent);
    }

    return { scrapingAgent, winningProductsAnalyzer, facebookAdsIntel };
}

// POST /api/agents/winning-products - Analyze winning products
export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const config = AnalysisConfigSchema.parse(body);

        // Get analyzer
        const { winningProductsAnalyzer } = getAnalyzers();

        // Perform analysis
        const analysis = await winningProductsAnalyzer.analyzeWinningProducts(config);

        // Store analysis results in database
        try {
            const { error: dbError } = await supabase
                .from('market_analyses')
                .insert({
                    user_id: user.id,
                    analysis_type: 'winning_products',
                    config: config,
                    results: {
                        totalProductsAnalyzed: analysis.totalProductsAnalyzed,
                        winningProductsCount: analysis.winningProducts.length,
                        topCategories: analysis.marketTrends.slice(0, 5),
                        insights: analysis.insights
                    },
                    full_data: analysis,
                    created_at: new Date().toISOString()
                });

            if (dbError) {
                console.error('Failed to store analysis:', dbError);
            }
        } catch (dbError) {
            console.error('Database error:', dbError);
        }

        return NextResponse.json({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error('Winning products analysis error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request data',
                        details: error.errors
                    }
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An unexpected error occurred',
                    details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
                }
            },
            { status: 500 }
        );
    }
}

// PUT /api/agents/winning-products/deep-dive - Deep dive analysis
export async function PUT(request: NextRequest) {
    try {
        // Check authentication
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const params = DeepDiveSchema.parse(body);

        // Get analyzer
        const { winningProductsAnalyzer } = getAnalyzers();

        // Perform deep dive analysis
        const analysis = await winningProductsAnalyzer.deepDiveAnalysis(params);

        // Store deep dive results
        try {
            const { error: dbError } = await supabase
                .from('market_analyses')
                .insert({
                    user_id: user.id,
                    analysis_type: 'deep_dive',
                    config: params,
                    results: {
                        productName: params.productName,
                        marketPosition: analysis.marketPosition,
                        recommendationsCount: analysis.recommendations.length
                    },
                    full_data: analysis,
                    created_at: new Date().toISOString()
                });

            if (dbError) {
                console.error('Failed to store deep dive analysis:', dbError);
            }
        } catch (dbError) {
            console.error('Database error:', dbError);
        }

        return NextResponse.json({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error('Deep dive analysis error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request data',
                        details: error.errors
                    }
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An unexpected error occurred'
                }
            },
            { status: 500 }
        );
    }
}

// PATCH /api/agents/winning-products/monitor - Monitor products
export async function PATCH(request: NextRequest) {
    try {
        // Check authentication
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const params = MonitoringSchema.parse(body);

        // Get analyzer
        const { winningProductsAnalyzer } = getAnalyzers();

        // Monitor products
        const monitoring = await winningProductsAnalyzer.monitorProducts(params.productIds);

        // Store monitoring results
        try {
            const { error: dbError } = await supabase
                .from('product_monitoring')
                .insert({
                    user_id: user.id,
                    product_ids: params.productIds,
                    updates: monitoring.updates,
                    monitored_at: new Date().toISOString()
                });

            if (dbError) {
                console.error('Failed to store monitoring results:', dbError);
            }
        } catch (dbError) {
            console.error('Database error:', dbError);
        }

        return NextResponse.json({
            success: true,
            data: monitoring
        });

    } catch (error) {
        console.error('Product monitoring error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request data',
                        details: error.errors
                    }
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An unexpected error occurred'
                }
            },
            { status: 500 }
        );
    }
}

// GET /api/agents/winning-products/facebook-ads - Facebook Ads intelligence
export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const keywords = searchParams.get('keywords')?.split(',') || [];
        const categories = searchParams.get('categories')?.split(',') || [];
        const country = searchParams.get('country') || 'US';
        const limit = parseInt(searchParams.get('limit') || '50');

        // Get Facebook Ads intelligence
        const { facebookAdsIntel } = getAnalyzers();

        // Search ads
        const ads = await facebookAdsIntel.searchAds({
            keywords,
            categories,
            country,
            activeStatus: 'active',
            limit
        });

        // Analyze trending products from ads
        const report = await facebookAdsIntel.analyzeTrendingProducts(ads);

        // Store Facebook ads analysis
        try {
            const { error: dbError } = await supabase
                .from('market_analyses')
                .insert({
                    user_id: user.id,
                    analysis_type: 'facebook_ads',
                    config: { keywords, categories, country, limit },
                    results: {
                        totalAds: report.totalAdsAnalyzed,
                        activeAds: report.activeAds,
                        trendingProductsCount: report.trendingProducts.length,
                        topCategories: report.topCategories.slice(0, 5)
                    },
                    full_data: report,
                    created_at: new Date().toISOString()
                });

            if (dbError) {
                console.error('Failed to store Facebook ads analysis:', dbError);
            }
        } catch (dbError) {
            console.error('Database error:', dbError);
        }

        return NextResponse.json({
            success: true,
            data: {
                ads: ads.slice(0, 20), // Limit ads in response
                report
            }
        });

    } catch (error) {
        console.error('Facebook ads intelligence error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to analyze Facebook ads'
                }
            },
            { status: 500 }
        );
    }
}

// DELETE /api/agents/winning-products/history - Clear analysis history
export async function DELETE(request: NextRequest) {
    try {
        // Check authentication
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        // Clear user's analysis history
        const { error: deleteError } = await supabase
            .from('market_analyses')
            .delete()
            .eq('user_id', user.id);

        if (deleteError) {
            throw deleteError;
        }

        return NextResponse.json({
            success: true,
            message: 'Analysis history cleared successfully'
        });

    } catch (error) {
        console.error('Clear history error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to clear analysis history'
                }
            },
            { status: 500 }
        );
    }
}