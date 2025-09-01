import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SubscriptionIntelligenceService } from '@/lib/services/subscription-intelligence';
import { z } from 'zod';

const ChurnPredictionRequestSchema = z.object({
    includeRetentionActions: z.boolean().optional().default(true),
    timeHorizon: z.number().min(1).max(365).optional().default(30), // days
});

// GET /api/subscription-intelligence/churn-prediction - Get churn risk assessment
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
        const includeRetentionActions = url.searchParams.get('includeRetentionActions') !== 'false';
        const timeHorizon = parseInt(url.searchParams.get('timeHorizon') || '30');

        const intelligenceService = new SubscriptionIntelligenceService();
        const intelligence = await intelligenceService.generateIntelligence(user.id);

        const response = {
            churnRisk: intelligence.churnRisk,
            retentionActions: includeRetentionActions ? intelligence.churnRisk.retentionActions : undefined,
            usagePatterns: intelligence.usagePatterns,
            currentTier: intelligence.currentTier,
        };

        return NextResponse.json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.error('Churn prediction error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/subscription-intelligence/churn-prediction - Get detailed churn analysis
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
        const validatedData = ChurnPredictionRequestSchema.parse(body);

        const intelligenceService = new SubscriptionIntelligenceService();
        const intelligence = await intelligenceService.generateIntelligence(user.id);

        // Enhanced churn analysis with additional insights
        const churnRisk = intelligence.churnRisk;

        // Calculate intervention urgency
        const interventionUrgency = churnRisk.riskLevel === 'critical' ? 'immediate' :
            churnRisk.riskLevel === 'high' ? 'within_week' :
                churnRisk.riskLevel === 'medium' ? 'within_month' : 'monitor';

        // Prioritize retention actions by estimated impact
        const prioritizedActions = churnRisk.retentionActions
            .sort((a, b) => b.estimatedImpact - a.estimatedImpact)
            .slice(0, 3); // Top 3 actions

        // Calculate retention investment ROI
        const customerLifetimeValue = intelligence.currentTier === 'pro' ? 348 : 0; // 12 months * $29
        const retentionInvestment = prioritizedActions
            .filter(action => action.cost)
            .reduce((sum, action) => sum + (action.cost || 0), 0);

        const retentionROI = retentionInvestment > 0 ?
            ((customerLifetimeValue - retentionInvestment) / retentionInvestment) * 100 : 0;

        return NextResponse.json({
            success: true,
            data: {
                churnRisk: {
                    ...churnRisk,
                    interventionUrgency,
                    customerLifetimeValue,
                    retentionInvestment,
                    retentionROI: Math.round(retentionROI),
                },
                prioritizedActions: validatedData.includeRetentionActions ? prioritizedActions : undefined,
                usagePatterns: intelligence.usagePatterns,
                recommendations: intelligence.recommendations.filter(r =>
                    r.type === 'maintain' || r.urgency === 'high'
                ),
            },
        });
    } catch (error) {
        console.error('Churn prediction POST error:', error);

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