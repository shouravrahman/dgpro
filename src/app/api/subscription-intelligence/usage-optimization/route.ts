import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SubscriptionIntelligenceService } from '@/lib/services/subscription-intelligence';
import { z } from 'zod';

const UsageOptimizationRequestSchema = z.object({
    optimizationType: z.enum(['cost', 'efficiency', 'features', 'workflow']).optional(),
    timeframe: z.enum(['week', 'month', 'quarter', 'year']).optional().default('month'),
    includeProjections: z.boolean().optional().default(true),
});

// GET /api/subscription-intelligence/usage-optimization - Get usage optimization suggestions
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

        // Calculate usage efficiency metrics
        const usageEfficiency = calculateUsageEfficiency(intelligence.usagePatterns);

        // Generate cost optimization suggestions
        const costOptimizations = generateCostOptimizations(intelligence);

        // Generate workflow optimizations
        const workflowOptimizations = generateWorkflowOptimizations(intelligence.usagePatterns);

        return NextResponse.json({
            success: true,
            data: {
                optimizationSuggestions: intelligence.optimizationSuggestions,
                usageEfficiency,
                costOptimizations,
                workflowOptimizations,
                usagePatterns: intelligence.usagePatterns,
                currentTier: intelligence.currentTier,
            },
        });
    } catch (error) {
        console.error('Usage optimization error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/subscription-intelligence/usage-optimization - Get targeted optimization recommendations
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
        const validatedData = UsageOptimizationRequestSchema.parse(body);

        const intelligenceService = new SubscriptionIntelligenceService();
        const intelligence = await intelligenceService.generateIntelligence(user.id);

        let optimizations = intelligence.optimizationSuggestions;

        // Filter by optimization type if specified
        if (validatedData.optimizationType) {
            optimizations = optimizations.filter(opt =>
                opt.type === validatedData.optimizationType ||
                opt.impact === `${validatedData.optimizationType}_saving` ||
                opt.impact === `${validatedData.optimizationType}_optimization`
            );
        }

        // Generate usage-based billing analysis
        const usageBasedBilling = generateUsageBasedBilling(intelligence, validatedData.timeframe);

        // Generate projections if requested
        let projections = undefined;
        if (validatedData.includeProjections) {
            projections = generateUsageProjections(intelligence.usagePatterns, validatedData.timeframe);
        }

        // Calculate potential savings and value
        const potentialSavings = optimizations
            .filter(opt => opt.potentialSavings)
            .reduce((sum, opt) => sum + (opt.potentialSavings || 0), 0);

        const potentialValue = optimizations
            .filter(opt => opt.potentialValue)
            .reduce((sum, opt) => sum + (opt.potentialValue || 0), 0);

        return NextResponse.json({
            success: true,
            data: {
                optimizations,
                usageBasedBilling,
                projections,
                metrics: {
                    potentialSavings,
                    potentialValue,
                    optimizationScore: calculateOptimizationScore(intelligence.usagePatterns),
                    efficiencyRating: calculateEfficiencyRating(intelligence.usagePatterns),
                },
                recommendations: intelligence.recommendations,
                alerts: generateUsageAlerts(intelligence.usagePatterns),
            },
        });
    } catch (error) {
        console.error('Usage optimization POST error:', error);

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

// Helper functions
function calculateUsageEfficiency(usagePatterns: any) {
    const metrics = [
        usagePatterns.aiRequests,
        usagePatterns.products,
        usagePatterns.marketplaceListings,
        usagePatterns.fileUploads,
    ];

    const totalEfficiency = metrics.reduce((sum, metric) => {
        if (metric.limit === -1) return sum + 100; // Unlimited = 100% efficient
        return sum + Math.min(100, (metric.current / metric.limit) * 100);
    }, 0);

    return {
        overall: Math.round(totalEfficiency / metrics.length),
        breakdown: {
            aiRequests: metrics[0].limit === -1 ? 100 : Math.min(100, (metrics[0].current / metrics[0].limit) * 100),
            products: metrics[1].limit === -1 ? 100 : Math.min(100, (metrics[1].current / metrics[1].limit) * 100),
            marketplaceListings: metrics[2].limit === -1 ? 100 : Math.min(100, (metrics[2].current / metrics[2].limit) * 100),
            fileUploads: metrics[3].limit === -1 ? 100 : Math.min(100, (metrics[3].current / metrics[3].limit) * 100),
        },
    };
}

function generateCostOptimizations(intelligence: any) {
    const optimizations = [];

    if (intelligence.currentTier === 'pro') {
        const lowUsage = Object.values(intelligence.usagePatterns).every((metric: any) =>
            metric.percentage < 30
        );

        if (lowUsage) {
            optimizations.push({
                type: 'plan_change',
                title: 'Consider Downgrading to Free Tier',
                description: 'Your usage is consistently low. You could save money with the free tier.',
                potentialSavings: 29,
                effort: 'low',
                impact: 'high',
                implementation: [
                    'Review your actual usage needs',
                    'Downgrade to free tier',
                    'Monitor usage and upgrade if needed',
                ],
            });
        }
    }

    if (intelligence.currentTier === 'free') {
        const highUsage = Object.values(intelligence.usagePatterns).some((metric: any) =>
            metric.percentage > 80
        );

        if (highUsage) {
            optimizations.push({
                type: 'plan_change',
                title: 'Upgrade to Pro for Better Value',
                description: 'You\'re hitting limits frequently. Pro offers unlimited usage.',
                potentialValue: 200,
                effort: 'low',
                impact: 'high',
                implementation: [
                    'Upgrade to Pro plan',
                    'Utilize unlimited features',
                    'Scale your operations',
                ],
            });
        }
    }

    return optimizations;
}

function generateWorkflowOptimizations(usagePatterns: any) {
    const optimizations = [];

    // Time-based optimization
    if (usagePatterns.timeOfDayUsage) {
        const peakHours = Object.entries(usagePatterns.timeOfDayUsage)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 3)
            .map(([hour]) => hour);

        optimizations.push({
            type: 'timing_optimization',
            title: 'Optimize Work Schedule',
            description: `You're most productive during hours ${peakHours.join(', ')}. Schedule important tasks then.`,
            effort: 'low',
            impact: 'medium',
            implementation: [
                'Block calendar during peak hours',
                'Schedule AI-intensive tasks during peak times',
                'Use off-peak hours for planning and review',
            ],
        });
    }

    // Feature utilization optimization
    const underutilizedFeatures = Object.entries(usagePatterns.featureUsage)
        .filter(([, usage]) => (usage as number) < 5)
        .map(([feature]) => feature);

    if (underutilizedFeatures.length > 0) {
        optimizations.push({
            type: 'feature_substitution',
            title: 'Explore Underutilized Features',
            description: `You have ${underutilizedFeatures.length} features that could improve your workflow.`,
            potentialValue: 50,
            effort: 'medium',
            impact: 'medium',
            implementation: underutilizedFeatures.map(feature => `Learn and integrate ${feature}`),
        });
    }

    return optimizations;
}

function generateUsageBasedBilling(intelligence: any, timeframe: string) {
    const currentPeriod = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        baseCost: intelligence.currentTier === 'pro' ? 29 : 0,
        usageCosts: {
            aiRequests: 0, // Currently no usage-based costs
            storage: 0,
            features: 0,
        },
        totalCost: intelligence.currentTier === 'pro' ? 29 : 0,
        projectedTotal: intelligence.currentTier === 'pro' ? 29 : 0,
    };

    const projectedCosts = {
        nextMonth: currentPeriod.totalCost,
        nextQuarter: currentPeriod.totalCost * 3,
        nextYear: currentPeriod.totalCost * 12,
        confidence: 85,
        factors: ['Current usage patterns', 'Historical trends', 'Seasonal adjustments'],
    };

    return {
        currentPeriod,
        projectedCosts,
        optimizations: [],
        alerts: [],
    };
}

function generateUsageProjections(usagePatterns: any, timeframe: string) {
    const multiplier = timeframe === 'week' ? 0.25 :
        timeframe === 'month' ? 1 :
            timeframe === 'quarter' ? 3 : 12;

    return {
        aiRequests: Math.round(usagePatterns.aiRequests.projectedMonthly * multiplier),
        products: Math.round(usagePatterns.products.projectedMonthly * multiplier),
        marketplaceListings: Math.round(usagePatterns.marketplaceListings.projectedMonthly * multiplier),
        fileUploads: Math.round(usagePatterns.fileUploads.projectedMonthly * multiplier),
        confidence: 75,
        timeframe,
    };
}

function calculateOptimizationScore(usagePatterns: any): number {
    // Score based on how well the user is utilizing their plan
    const metrics = [
        usagePatterns.aiRequests,
        usagePatterns.products,
        usagePatterns.marketplaceListings,
        usagePatterns.fileUploads,
    ];

    const utilizationScores = metrics.map(metric => {
        if (metric.limit === -1) return 100; // Unlimited plans are always optimal
        const utilization = (metric.current / metric.limit) * 100;
        // Optimal utilization is 60-80%
        if (utilization >= 60 && utilization <= 80) return 100;
        if (utilization < 60) return utilization + 20; // Underutilization penalty
        return Math.max(0, 100 - (utilization - 80)); // Overutilization penalty
    });

    return Math.round(utilizationScores.reduce((sum, score) => sum + score, 0) / utilizationScores.length);
}

function calculateEfficiencyRating(usagePatterns: any): 'excellent' | 'good' | 'fair' | 'poor' {
    const score = calculateOptimizationScore(usagePatterns);
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
}

function generateUsageAlerts(usagePatterns: any) {
    const alerts = [];

    // Check for approaching limits
    Object.entries(usagePatterns).forEach(([key, metric]: [string, any]) => {
        if (metric.percentage && metric.percentage > 80 && metric.limit !== -1) {
            alerts.push({
                type: 'approaching_limit',
                severity: metric.percentage > 95 ? 'critical' : 'warning',
                title: `${key} limit approaching`,
                message: `You've used ${metric.percentage}% of your ${key} limit`,
                threshold: metric.limit,
                currentValue: metric.current,
                suggestedActions: [
                    'Consider upgrading to Pro for unlimited usage',
                    'Optimize your current usage patterns',
                    'Monitor usage more closely',
                ],
                createdAt: new Date().toISOString(),
            });
        }
    });

    return alerts;
}