/**
 * Market Intelligence API Route
 * Handles market analysis requests and returns AI-powered insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MarketIntelligenceAgent } from '@/lib/ai/agents/market-intelligence-agent';
import { MarketIntelligenceService } from '@/lib/database/services/market-intelligence.service';

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { type, data } = body;

        if (!type) {
            return NextResponse.json(
                { success: false, error: 'Analysis type is required' },
                { status: 400 }
            );
        }

        // Initialize services
        const marketService = new MarketIntelligenceService();
        const agent = new MarketIntelligenceAgent({ userId: user.id });

        // Get user onboarding data for personalization
        let userPreferences = null;
        if (type === 'personalized_insights') {
            try {
                const { data: onboardingData } = await supabase
                    .from('user_onboarding_status')
                    .select('step1_data, step2_data, role')
                    .eq('user_id', user.id)
                    .single();

                if (onboardingData) {
                    userPreferences = {
                        interests: onboardingData.step1_data?.productTypes || [],
                        experienceLevel: onboardingData.step1_data?.experience || 'beginner',
                        targetRevenue: onboardingData.step2_data?.monthlyRevenue || 1000,
                        productTypes: onboardingData.step1_data?.productTypes || [],
                        role: onboardingData.role
                    };
                }
            } catch (error) {
                console.error('Error fetching user preferences:', error);
            }
        }

        // Prepare analysis input
        const analysisInput = {
            type,
            data: {
                ...data,
                userPreferences
            }
        };

        // Execute AI analysis
        const result = await agent.execute(analysisInput);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        // Save analysis to database
        try {
            await marketService.saveAIAnalysis({
                target_type: type,
                user_id: user.id,
                agent_type: 'market-intelligence',
                model_used: 'gemini-1.5-pro',
                analysis_results: result.data,
                confidence_score: result.metadata?.confidence || 0.8,
                processing_time_ms: result.metadata?.processingTime || 0,
                tokens_used: result.metadata?.tokensUsed || 0
            });
        } catch (dbError) {
            console.error('Error saving analysis to database:', dbError);
            // Continue even if DB save fails
        }

        return NextResponse.json({
            success: true,
            data: result.data,
            metadata: result.metadata
        });

    } catch (error) {
        console.error('Market intelligence API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const marketService = new MarketIntelligenceService();

        switch (action) {
            case 'trending-products':
                const limit = parseInt(searchParams.get('limit') || '20');
                const trendingProducts = await marketService.getTrendingProducts(limit);
                return NextResponse.json({
                    success: true,
                    data: trendingProducts
                });

            case 'high-opportunity':
                const opportunityLimit = parseInt(searchParams.get('limit') || '20');
                const opportunities = await marketService.getHighOpportunityProducts(opportunityLimit);
                return NextResponse.json({
                    success: true,
                    data: opportunities
                });

            case 'market-trends':
                const categoryId = searchParams.get('categoryId');
                const trendType = searchParams.get('trendType');
                const trendsLimit = parseInt(searchParams.get('limit') || '20');
                const trends = await marketService.getMarketTrends(categoryId || undefined, trendType || undefined, trendsLimit);
                return NextResponse.json({
                    success: true,
                    data: trends
                });

            case 'user-insights':
                const userInsights = await marketService.getUserMarketInsights(user.id);
                return NextResponse.json({
                    success: true,
                    data: userInsights
                });

            case 'categories':
                const categories = await marketService.getMarketCategories();
                return NextResponse.json({
                    success: true,
                    data: categories
                });

            case 'platforms':
                const platforms = await marketService.getMarketPlatforms();
                return NextResponse.json({
                    success: true,
                    data: platforms
                });

            case 'overview':
                const overview = await marketService.getMarketOverview();
                return NextResponse.json({
                    success: true,
                    data: overview
                });

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action parameter' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('Market intelligence GET API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}