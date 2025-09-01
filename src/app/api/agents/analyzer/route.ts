import { NextRequest, NextResponse } from 'next/server';
import { AnalysisAgent } from '@/lib/ai/agents/analysis-agent';
import type {
  ProductAnalysisRequest,
  ProductAnalysisResult,
  TrendDetectionResult,
  CompetitiveLandscapeResult,
  RecommendationResult
} from '@/lib/ai/agents/analysis-agent';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schemas
const ProductAnalysisRequestSchema = z.object({
  productData: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    pricing: z.object({
      amount: z.number().optional(),
      currency: z.string().optional(),
      type: z.enum(['free', 'one-time', 'subscription'])
    }).optional(),
    features: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    category: z.string().optional(),
    source: z.string().optional(),
    url: z.string().url().optional()
  }),
  competitorData: z.array(z.object({
    title: z.string(),
    pricing: z.number().optional(),
    features: z.array(z.string()).optional(),
    source: z.string()
  })).optional(),
  marketContext: z.object({
    category: z.string(),
    trends: z.array(z.string()).optional(),
    averagePrice: z.number().optional(),
    competitorCount: z.number().optional()
  }).optional(),
  analysisType: z.enum(['comprehensive', 'competitive', 'market-positioning', 'trend-analysis', 'recommendation'])
});

const TrendDetectionSchema = z.object({
  categories: z.array(z.string()).optional(),
  timeframe: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
  sources: z.array(z.string()).optional(),
  includeEmergingTrends: z.boolean().default(true)
});

const CompetitiveLandscapeSchema = z.object({
  productCategory: z.string().min(1),
  targetProduct: z.object({
    name: z.string(),
    features: z.array(z.string()),
    pricing: z.number().optional()
  }).optional(),
  competitors: z.array(z.object({
    name: z.string(),
    features: z.array(z.string()),
    pricing: z.number().optional(),
    marketShare: z.number().optional()
  })).optional(),
  marketSize: z.number().optional()
});

const RecommendationSchema = z.object({
  analysisResults: z.array(z.any()), // ProductAnalysisResult array
  userGoals: z.object({
    revenue: z.number().optional(),
    timeframe: z.string().optional(),
    riskTolerance: z.enum(['low', 'medium', 'high']).optional(),
    resources: z.array(z.string()).optional()
  }).optional(),
  marketConstraints: z.object({
    budget: z.number().optional(),
    timeline: z.string().optional(),
    teamSize: z.number().optional()
  }).optional()
});

// Initialize analysis agent
let analysisAgent: AnalysisAgent | null = null;

function getAnalysisAgent(): AnalysisAgent {
  if (!analysisAgent) {
    analysisAgent = new AnalysisAgent({
      // Use environment-specific configuration
      timeout: 45000,
      maxRetries: 3,
      cacheEnabled: true,
      cacheTTL: 3600
    });
  }
  return analysisAgent;
}

// POST /api/agents/analyzer - Analyze product
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
    const analysisRequest = ProductAnalysisRequestSchema.parse(body);

    // Get analysis agent
    const agent = getAnalysisAgent();

    // Perform analysis
    const result = await agent.analyzeProduct(analysisRequest);

    // Store analysis result in database
    try {
      const { error: dbError } = await supabase
        .from('product_analyses')
        .insert({
          user_id: user.id,
          product_id: result.productId,
          analysis_type: result.analysisType,
          product_data: analysisRequest.productData,
          scores: result.scores,
          market_positioning: result.marketPositioning,
          competitive_analysis: result.competitiveAnalysis,
          trend_analysis: result.trendAnalysis,
          recommendations: result.recommendations,
          confidence: result.confidence,
          full_result: result,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Failed to store analysis result:', dbError);
        // Don't fail the request, just log the error
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Product analysis error:', error);

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

// PUT /api/agents/analyzer/trends - Detect trends
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
    const trendParams = TrendDetectionSchema.parse(body);

    // Get analysis agent
    const agent = getAnalysisAgent();

    // Detect trends
    const result = await agent.detectTrends(trendParams);

    // Store trend analysis
    try {
      const { error: dbError } = await supabase
        .from('trend_analyses')
        .insert({
          user_id: user.id,
          categories: trendParams.categories || [],
          timeframe: trendParams.timeframe,
          trends: result.trends,
          insights: result.insights,
          predictions: result.predictions,
          full_result: result,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Failed to store trend analysis:', dbError);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Trend detection error:', error);

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
          message: 'Failed to detect trends'
        }
      },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/analyzer/competitive - Analyze competitive landscape
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
    const competitiveParams = CompetitiveLandscapeSchema.parse(body);

    // Get analysis agent
    const agent = getAnalysisAgent();

    // Analyze competitive landscape
    const result = await agent.analyzeCompetitiveLandscape(competitiveParams);

    // Store competitive analysis
    try {
      const { error: dbError } = await supabase
        .from('competitive_analyses')
        .insert({
          user_id: user.id,
          product_category: competitiveParams.productCategory,
          target_product: competitiveParams.targetProduct,
          competitors: competitiveParams.competitors || [],
          market_size: competitiveParams.marketSize,
          landscape: result.landscape,
          opportunities: result.opportunities,
          recommendations: result.recommendations,
          full_result: result,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Failed to store competitive analysis:', dbError);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Competitive analysis error:', error);

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
          message: 'Failed to analyze competitive landscape'
        }
      },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/analyzer/recommendations - Generate recommendations
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

    // Parse and validate request body
    const body = await request.json();
    const recommendationParams = RecommendationSchema.parse(body);

    // Get analysis agent
    const agent = getAnalysisAgent();

    // Generate recommendations
    const result = await agent.generateRecommendations(recommendationParams);

    // Store recommendations
    try {
      const { error: dbError } = await supabase
        .from('analysis_recommendations')
        .insert({
          user_id: user.id,
          analysis_results: recommendationParams.analysisResults,
          user_goals: recommendationParams.userGoals,
          market_constraints: recommendationParams.marketConstraints,
          recommendations: result.recommendations,
          strategy: result.strategy,
          risk_mitigation: result.riskMitigation,
          full_result: result,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Failed to store recommendations:', dbError);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Recommendation generation error:', error);

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
          message: 'Failed to generate recommendations'
        }
      },
      { status: 500 }
    );
  }
}

// GET /api/agents/analyzer/history - Get analysis history
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
    const analysisType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('product_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (analysisType) {
      query = query.eq('analysis_type', analysisType);
    }

    const { data: analyses, error: queryError } = await query;

    if (queryError) {
      throw queryError;
    }

    // Get total count
    let countQuery = supabase
      .from('product_analyses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (analysisType) {
      countQuery = countQuery.eq('analysis_type', analysisType);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      success: true,
      data: {
        analyses: analyses || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit
        }
      }
    });

  } catch (error) {
    console.error('Get analysis history error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve analysis history'
        }
      },
      { status: 500 }
    );
  }
}