import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SubscriptionIntelligenceService } from '@/lib/services/subscription-intelligence';
import { z } from 'zod';

const RecommendationRequestSchema = z.object({
    currentUsage: z.record(z.string(), z.number()).optional(),
    goals: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional(),
    timeframe: z.enum(['week', 'month', 'quarter', 'year']).optional().default('month'),
});

// GET /api/subscription-intelligence/recommendations - Get subscription recommendations
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

        const intelligenceService = new SubscriptionIntelligenceService();
        const intelligence = await intelligenceService.generateIntelligence(user.id);

        return NextResponse.json({
            success: true,
            data: {
                recommendations: intelligence.recommendations,
                currentTier: intelligence.currentTier,
                usagePatterns: intelligence.usagePatterns,
            },
        });
    } catch (error) {
        console.error('Recommendations error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/subscription-intelligence/recommendations - Get optimized recommendations
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
        const validatedData = RecommendationRequestSchema.parse(body);

        const intelligenceService = new SubscriptionIntelligenceService();
        const intelligence = await intelligenceService.generateIntelligence(user.id);

        // Filter recommendations based on goals and constraints
        let filteredRecommendations = intelligence.recommendations;

        if (validatedData.goals?.includes('cost_optimization')) {
            filteredRecommendations = filteredRecommendations.filter(r =>
                r.type === 'downgrade' || r.potentialSavings
            );
        }

        if (validatedData.goals?.includes('feature_access')) {
            filteredRecommendations = filteredRecommendations.filter(r =>
                r.type === 'upgrade' || r.potentialValue
            );
        }

        if (validatedData.constraints?.includes('budget_conscious')) {
            filteredRecommendations = filteredRecommendations.map(r => ({
                ...r,
                interval: 'yearly', // Suggest yearly for better value
            }));
        }

        // Calculate projected savings/value
        const projectedSavings = filteredRecommendations
            .filter(r => r.potentialSavings)
            .reduce((sum, r) => sum + (r.potentialSavings || 0), 0);

        const projectedValue = filteredRecommendations
            .filter(r => r.potentialValue)
            .reduce((sum, r) => sum + (r.potentialValue || 0), 0);

        return NextResponse.json({
            success: true,
            data: {
                recommendations: filteredRecommendations,
                optimizations: intelligence.optimizationSuggestions,
                projectedSavings,
                projectedValue,
                currentTier: intelligence.currentTier,
                usagePatterns: intelligence.usagePatterns,
            },
        });
    } catch (error) {
        console.error('Recommendations POST error:', error);

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