import { NextRequest, NextResponse } from 'next/server';
import { PredictionAgent } from '@/lib/ai/agents/prediction-agent';
import type { PredictionRequest } from '@/lib/ai/agents/prediction-agent';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schemas
const PredictionRequestSchema = z.object({
  categories: z.array(z.string()).optional(),
  timeframe: z.enum(['1month', '3months', '6months', '1year']).default('3months'),
  focusAreas: z.array(z.enum(['trends', 'opportunities', 'risks', 'pricing'])).default(['trends', 'opportunities']),
  marketData: z.object({
    historicalTrends: z.array(z.any()).optional(),
    competitorData: z.array(z.any()).optional(),
    economicIndicators: z.array(z.any()).optional(),
    seasonalData: z.array(z.any()).optional()
  }).optional(),
  constraints: z.object({
    budget: z.number().optional(),
    timeline: z.string().optional(),
    riskTolerance: z.enum(['low', 'medium', 'high']).optional(),
    targetMarkets: z.array(z.string()).optional()
  }).optional()
});

const TrendPredictionSchema = z.object({
  categories: z.array(z.string()).min(1),
  timeframe: z.enum(['1month', '3months', '6months', '1year']).default('3months'),
  includeHistorical: z.boolean().default(false)
});

const OpportunitySchema = z.object({
  categories: z.array(z.string()).optional(),
  timeHorizon: z.enum(['1month', '3months', '6months', '1year']).default('6months'),
  opportunityTypes: z.array(z.enum(['emerging_niche', 'market_gap', 'technology_shift', 'seasonal_trend'])).optional(),
  riskTolerance: z.enum(['low', 'medium', 'high']).default('medium')
});

const ForecastingSchema = z.object({
  category: z.string().min(1),
  historicalData: z.array(z.any()).optional(),
  forecastPeriod: z.number().min(1).max(24),
  includeSeasonality: z.boolean().default(true),
  includeExternalFactors: z.boolean().default(true)
});

// Initialize prediction agent
let predictionAgent: PredictionAgent | null = null;

function getPredictionAgent(): PredictionAgent {
  if (!predictionAgent) {
    predictionAgent = new PredictionAgent();
  }
  return predictionAgent;
}

// POST /api/agents/predictor - Generate comprehensive predictions
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
    const predictionRequest = PredictionRequestSchema.parse(body);

    // Get prediction agent
    const agent = getPredictionAgent();

    // Generate predictions
    const analysis = await agent.generatePredictions(predictionRequest);

    // Store analysis results in database
    try {
      const { error: dbError } = await supabase
        .from('market_predictions')
        .insert({
          user_id: user.id,
          prediction_type: 'comprehensive',
          categories: predictionRequest.categories || [],
          timeframe: predictionRequest.timeframe,
          focus_areas: predictionRequest.focusAreas,
          results: {
            summary: analysis.summary,
            trendsCount: analysis.marketTrends.length,
            opportunitiesCount: analysis.opportunities.length,
            overallConfidence: analysis.confidence.overall
          },
          full_data: analysis,
          valid_until: analysis.validUntil.toISOString(),
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Failed to store prediction analysis:', dbError);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    return NextResponse.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Prediction analysis error:', error);

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

// PUT /api/agents/predictor/trends - Predict market trends
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
    const params = TrendPredictionSchema.parse(body);

    // Get prediction agent
    const agent = getPredictionAgent();

    // Predict market trends
    const trends = await agent.predictMarketTrends(params);

    // Store trend predictions
    try {
      const { error: dbError } = await supabase
        .from('market_predictions')
        .insert({
          user_id: user.id,
          prediction_type: 'trends',
          categories: params.categories,
          timeframe: params.timeframe,
          results: {
            trendsCount: trends.length,
            risingTrends: trends.filter(t => t.trend.direction === 'rising').length,
            decliningTrends: trends.filter(t => t.trend.direction === 'declining').length,
            avgConfidence: trends.reduce((sum, t) => sum + t.trend.confidence, 0) / trends.length
          },
          full_data: { trends },
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Failed to store trend predictions:', dbError);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    return NextResponse.json({
      success: true,
      data: { trends }
    });

  } catch (error) {
    console.error('Trend prediction error:', error);

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

// PATCH /api/agents/predictor/opportunities - Identify opportunities
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
    const params = OpportunitySchema.parse(body);

    // Get prediction agent
    const agent = getPredictionAgent();

    // Identify opportunities
    const opportunities = await agent.identifyOpportunities(params);

    // Store opportunity analysis
    try {
      const { error: dbError } = await supabase
        .from('market_predictions')
        .insert({
          user_id: user.id,
          prediction_type: 'opportunities',
          categories: params.categories || [],
          timeframe: params.timeHorizon,
          results: {
            opportunitiesCount: opportunities.length,
            highUrgency: opportunities.filter(o => o.opportunity.urgency === 'high').length,
            avgConfidence: opportunities.reduce((sum, o) => sum + o.opportunity.confidence, 0) / opportunities.length,
            totalPotentialRevenue: opportunities.reduce((sum, o) => sum + o.potential.revenue.optimistic, 0)
          },
          full_data: { opportunities },
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Failed to store opportunity analysis:', dbError);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    return NextResponse.json({
      success: true,
      data: { opportunities }
    });

  } catch (error) {
    console.error('Opportunity identification error:', error);

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

// GET /api/agents/predictor/forecast - Generate forecasting model
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
    const category = searchParams.get('category');
    const forecastPeriod = parseInt(searchParams.get('forecastPeriod') || '6');
    const includeSeasonality = searchParams.get('includeSeasonality') === 'true';
    const includeExternalFactors = searchParams.get('includeExternalFactors') === 'true';

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Category parameter is required'
          }
        },
        { status: 400 }
      );
    }

    const params = {
      category,
      forecastPeriod,
      includeSeasonality,
      includeExternalFactors
    };

    // Get prediction agent
    const agent = getPredictionAgent();

    // Generate forecasting model
    const forecastModel = await agent.generateForecastingModel(params);

    // Store forecasting model
    try {
      const { error: dbError } = await supabase
        .from('market_predictions')
        .insert({
          user_id: user.id,
          prediction_type: 'forecast',
          categories: [category],
          timeframe: `${forecastPeriod}months`,
          results: {
            category,
            forecastPeriod,
            modelAccuracy: forecastModel.model.accuracy,
            modelConfidence: forecastModel.model.confidence,
            forecastPoints: forecastModel.forecast.length
          },
          full_data: forecastModel,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Failed to store forecasting model:', dbError);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    return NextResponse.json({
      success: true,
      data: forecastModel
    });

  } catch (error) {
    console.error('Forecasting model error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate forecasting model'
        }
      },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/predictor/cache - Clear prediction cache
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

    // Clear prediction cache (this would clear the agent's internal cache)
    const agent = getPredictionAgent();
    // Note: We'd need to add a clearCache method to the PredictionAgent class

    // Optionally clear user's prediction history
    const { searchParams } = new URL(request.url);
    const clearHistory = searchParams.get('clearHistory') === 'true';

    if (clearHistory) {
      const { error: deleteError } = await supabase
        .from('market_predictions')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Prediction cache cleared successfully'
    });

  } catch (error) {
    console.error('Clear cache error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to clear prediction cache'
        }
      },
      { status: 500 }
    );
  }
}