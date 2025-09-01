import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SubscriptionIntelligenceService } from '@/lib/services/subscription-intelligence';
import { z } from 'zod';

const IntelligenceRequestSchema = z.object({
    includeRecommendations: z.boolean().optional().default(true),
    includeChurnAnalysis: z.boolean().optional().default(true),
    includePersonalizedOffers: z.boolean().optional().default(true),
    includeDynamicPricing: z.boolean().optional().default(false),
    timeframe: z.enum(['week', 'month', 'quarter', 'year']).optional().default('month'),
});

// GET /api/subscription-intelligence - Get comprehensive subscription intelligence
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const params = Object.fromEntries(url.searchParams.entries());

        // Convert string booleans to actual booleans
        const processedParams = {
            ...params,
            includeRecommendations: params.includeRecommendations !== 'false',
            includeChurnAnalysis: params.includeChurnAnalysis !== 'false',
            includePersonalizedOffers: params.includePersonalizedOffers !== 'false',
            includeDynamicPricing: params.includeDynamicPricing === 'true',
        };

        const validatedParams = IntelligenceRequestSchema.parse(processedParams);

        const intelligenceService = new SubscriptionIntelligenceService();
        const intelligence = await intelligenceService.generateIntelligence(user.id);

        // Filter response based on request parameters
        const response = {
            ...intelligence,
            recommendations: validatedParams.includeRecommendations ? intelligence.recommendations : undefined,
            churnRisk: validatedParams.includeChurnAnalysis ? intelligence.churnRisk : undefined,
            personalizedOffers: validatedParams.includePersonalizedOffers ? intelligence.personalizedOffers : undefined,
        };

        return NextResponse.json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.error('Subscription intelligence error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request parameters', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/subscription-intelligence - Generate intelligence with custom parameters
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = IntelligenceRequestSchema.parse(body);

        const intelligenceService = new SubscriptionIntelligenceService();
        const intelligence = await intelligenceService.generateIntelligence(user.id);

        // Add dynamic pricing if requested
        let dynamicPricing = undefined;
        if (validatedData.includeDynamicPricing) {
            dynamicPricing = await intelligenceService.generateDynamicPricing(user.id);
        }

        const response = {
            ...intelligence,
            dynamicPricing,
            recommendations: validatedData.includeRecommendations ? intelligence.recommendations : undefined,
            churnRisk: validatedData.includeChurnAnalysis ? intelligence.churnRisk : undefined,
            personalizedOffers: validatedData.includePersonalizedOffers ? intelligence.personalizedOffers : undefined,
        };

        return NextResponse.json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.error('Subscription intelligence POST error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}