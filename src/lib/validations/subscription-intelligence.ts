import { z } from 'zod';

// Base validation schemas
export const UsageMetricSchema = z.object({
    current: z.number().min(0),
    limit: z.number().min(-1), // -1 for unlimited
    percentage: z.number().min(0).max(100),
    trend: z.enum(['increasing', 'decreasing', 'stable']),
    weeklyAverage: z.number().min(0),
    monthlyAverage: z.number().min(0),
    peakUsage: z.number().min(0),
    projectedMonthly: z.number().min(0),
});

export const WeeklyTrendSchema = z.object({
    week: z.string().regex(/^\d{4}-W\d{2}$/), // ISO week format
    usage: z.record(z.string(), z.number()),
    totalActivity: z.number().min(0),
});

export const UsagePatternsSchema = z.object({
    aiRequests: UsageMetricSchema,
    products: UsageMetricSchema,
    marketplaceListings: UsageMetricSchema,
    fileUploads: UsageMetricSchema,
    storage: UsageMetricSchema,
    loginFrequency: z.number().min(0).max(7),
    featureUsage: z.record(z.string(), z.number()),
    timeOfDayUsage: z.record(z.string(), z.number()),
    weeklyTrends: z.array(WeeklyTrendSchema),
    monthlyGrowth: z.number(),
});

export const SubscriptionRecommendationSchema = z.object({
    type: z.enum(['upgrade', 'downgrade', 'maintain', 'pause']),
    tier: z.enum(['free', 'pro']).optional(),
    interval: z.enum(['monthly', 'yearly']).optional(),
    confidence: z.number().min(0).max(100),
    reasoning: z.array(z.string()),
    potentialSavings: z.number().min(0).optional(),
    potentialValue: z.number().min(0).optional(),
    urgency: z.enum(['low', 'medium', 'high']),
    validUntil: z.string().datetime(),
});

export const ChurnFactorSchema = z.object({
    factor: z.string(),
    impact: z.enum(['positive', 'negative']),
    weight: z.number(),
    description: z.string(),
});

export const RetentionActionSchema = z.object({
    type: z.enum(['discount', 'feature_unlock', 'support', 'education', 'pause_option']),
    title: z.string(),
    description: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    estimatedImpact: z.number().min(0).max(100),
    cost: z.number().min(0).optional(),
});

export const ChurnRiskAssessmentSchema = z.object({
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
    score: z.number().min(0).max(100),
    factors: z.array(ChurnFactorSchema),
    retentionActions: z.array(RetentionActionSchema),
    timeToChurn: z.number().min(1).optional(),
    confidence: z.number().min(0).max(100),
});

export const PersonalizedOfferSchema = z.object({
    id: z.string(),
    type: z.enum(['discount', 'trial_extension', 'feature_unlock', 'bonus_credits']),
    title: z.string(),
    description: z.string(),
    value: z.number().min(0),
    originalPrice: z.number().min(0).optional(),
    discountedPrice: z.number().min(0).optional(),
    discountPercentage: z.number().min(0).max(100).optional(),
    validUntil: z.string().datetime(),
    conditions: z.array(z.string()).optional(),
    targetSegment: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    estimatedConversion: z.number().min(0).max(100),
});

export const OptimizationSuggestionSchema = z.object({
    type: z.enum(['usage', 'billing', 'features', 'workflow']),
    title: z.string(),
    description: z.string(),
    impact: z.enum(['cost_saving', 'efficiency', 'feature_discovery', 'limit_optimization']),
    potentialSavings: z.number().min(0).optional(),
    potentialValue: z.number().min(0).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    estimatedTime: z.string().optional(),
    steps: z.array(z.string()).optional(),
});

export const UserSegmentSchema = z.object({
    type: z.enum(['new_user', 'power_user', 'casual_user', 'at_risk', 'high_value', 'price_sensitive']),
    characteristics: z.array(z.string()),
    typicalBehavior: z.array(z.string()),
    recommendedStrategy: z.string(),
});

export const PricingFactorSchema = z.object({
    factor: z.string(),
    adjustment: z.number().min(0),
    reasoning: z.string(),
});

export const DynamicPricingSchema = z.object({
    userId: z.string().uuid(),
    basePrice: z.number().min(0),
    adjustedPrice: z.number().min(0),
    adjustmentFactor: z.number().min(0),
    reasoning: z.array(PricingFactorSchema),
    validUntil: z.string().datetime(),
    segment: UserSegmentSchema,
});

export const SubscriptionIntelligenceSchema = z.object({
    userId: z.string().uuid(),
    currentTier: z.enum(['free', 'pro']),
    usagePatterns: UsagePatternsSchema,
    recommendations: z.array(SubscriptionRecommendationSchema),
    churnRisk: ChurnRiskAssessmentSchema,
    personalizedOffers: z.array(PersonalizedOfferSchema),
    optimizationSuggestions: z.array(OptimizationSuggestionSchema),
});

// API Request/Response schemas
export const IntelligenceRequestSchema = z.object({
    includeRecommendations: z.boolean().optional().default(true),
    includeChurnAnalysis: z.boolean().optional().default(true),
    includePersonalizedOffers: z.boolean().optional().default(true),
    includeDynamicPricing: z.boolean().optional().default(false),
    timeframe: z.enum(['week', 'month', 'quarter', 'year']).optional().default('month'),
});

export const OptimizationRequestSchema = z.object({
    currentUsage: z.record(z.string(), z.number()).optional(),
    goals: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional(),
    timeframe: z.enum(['week', 'month', 'quarter', 'year']).optional().default('month'),
});

export const ChurnPredictionRequestSchema = z.object({
    includeRetentionActions: z.boolean().optional().default(true),
    timeHorizon: z.number().min(1).max(365).optional().default(30),
});

export const PersonalizedOffersRequestSchema = z.object({
    offerTypes: z.array(z.enum(['discount', 'trial_extension', 'feature_unlock', 'bonus_credits'])).optional(),
    maxOffers: z.number().min(1).max(10).optional().default(5),
    targetSegment: z.string().optional(),
});

export const UsageOptimizationRequestSchema = z.object({
    optimizationType: z.enum(['cost', 'efficiency', 'features', 'workflow']).optional(),
    timeframe: z.enum(['week', 'month', 'quarter', 'year']).optional().default('month'),
    includeProjections: z.boolean().optional().default(true),
});

export const OfferActionRequestSchema = z.object({
    offerId: z.string(),
    action: z.enum(['accepted', 'declined', 'viewed']),
});

// Usage analytics schemas
export const FeatureUsageSchema = z.object({
    userId: z.string().uuid(),
    featureName: z.string(),
    usageCount: z.number().min(0).optional().default(1),
    usageDuration: z.number().min(0).optional().default(0),
    sessionId: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
});

export const UsageAlertSchema = z.object({
    type: z.enum(['approaching_limit', 'unusual_spike', 'cost_increase', 'optimization_opportunity']),
    severity: z.enum(['info', 'warning', 'critical']),
    title: z.string(),
    message: z.string(),
    threshold: z.number().optional(),
    currentValue: z.number().optional(),
    suggestedActions: z.array(z.string()),
    createdAt: z.string().datetime(),
});

// Billing optimization schemas
export const BillingPeriodSchema = z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
    baseCost: z.number().min(0),
    usageCosts: z.record(z.string(), z.number()),
    totalCost: z.number().min(0),
    projectedTotal: z.number().min(0),
});

export const ProjectedCostsSchema = z.object({
    nextMonth: z.number().min(0),
    nextQuarter: z.number().min(0),
    nextYear: z.number().min(0),
    confidence: z.number().min(0).max(100),
    factors: z.array(z.string()),
});

export const BillingOptimizationSchema = z.object({
    type: z.enum(['plan_change', 'usage_reduction', 'timing_optimization', 'feature_substitution']),
    title: z.string(),
    description: z.string(),
    potentialSavings: z.number().min(0),
    effort: z.enum(['low', 'medium', 'high']),
    impact: z.enum(['low', 'medium', 'high']),
    implementation: z.array(z.string()),
});

export const UsageBasedBillingSchema = z.object({
    userId: z.string().uuid(),
    currentPeriod: BillingPeriodSchema,
    projectedCosts: ProjectedCostsSchema,
    optimizations: z.array(BillingOptimizationSchema),
    alerts: z.array(UsageAlertSchema),
});

// Analytics schemas
export const AnalyticsMetricsSchema = z.object({
    totalSpent: z.number().min(0),
    valueReceived: z.number().min(0),
    roi: z.number(),
    efficiencyScore: z.number().min(0).max(100),
    featureUtilization: z.record(z.string(), z.number()),
    costPerFeature: z.record(z.string(), z.number()),
    timeToValue: z.number().min(0),
});

export const PeriodComparisonSchema = z.object({
    period: z.string(),
    metric: z.string(),
    previousValue: z.number(),
    currentValue: z.number(),
    change: z.number(),
    changePercentage: z.number(),
    trend: z.enum(['improving', 'declining', 'stable']),
});

export const AnalyticsInsightSchema = z.object({
    type: z.enum(['cost_efficiency', 'feature_usage', 'value_realization', 'optimization']),
    title: z.string(),
    description: z.string(),
    impact: z.enum(['positive', 'negative', 'neutral']),
    actionable: z.boolean(),
    recommendations: z.array(z.string()).optional(),
});

export const SubscriptionAnalyticsSchema = z.object({
    userId: z.string().uuid(),
    period: z.string(),
    metrics: AnalyticsMetricsSchema,
    comparisons: z.array(PeriodComparisonSchema),
    insights: z.array(AnalyticsInsightSchema),
});

// Response schemas
export const IntelligenceResponseSchema = z.object({
    success: z.boolean(),
    data: SubscriptionIntelligenceSchema.optional(),
    error: z.string().optional(),
});

export const OptimizationResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        recommendations: z.array(SubscriptionRecommendationSchema),
        optimizations: z.array(BillingOptimizationSchema),
        projectedSavings: z.number().min(0),
    }).optional(),
    error: z.string().optional(),
});

export const ChurnPredictionResponseSchema = z.object({
    success: z.boolean(),
    data: ChurnRiskAssessmentSchema.optional(),
    error: z.string().optional(),
});

export const PersonalizedOffersResponseSchema = z.object({
    success: z.boolean(),
    data: z.array(PersonalizedOfferSchema).optional(),
    error: z.string().optional(),
});

// Validation helper functions
export function validateUsagePatterns(data: unknown): UsagePatternsSchema {
    return UsagePatternsSchema.parse(data);
}

export function validateSubscriptionRecommendation(data: unknown): SubscriptionRecommendationSchema {
    return SubscriptionRecommendationSchema.parse(data);
}

export function validateChurnRiskAssessment(data: unknown): ChurnRiskAssessmentSchema {
    return ChurnRiskAssessmentSchema.parse(data);
}

export function validatePersonalizedOffer(data: unknown): PersonalizedOfferSchema {
    return PersonalizedOfferSchema.parse(data);
}

export function validateDynamicPricing(data: unknown): DynamicPricingSchema {
    return DynamicPricingSchema.parse(data);
}

export function validateSubscriptionIntelligence(data: unknown): SubscriptionIntelligenceSchema {
    return SubscriptionIntelligenceSchema.parse(data);
}

// Type exports for TypeScript
export type UsageMetric = z.infer<typeof UsageMetricSchema>;
export type WeeklyTrend = z.infer<typeof WeeklyTrendSchema>;
export type UsagePatterns = z.infer<typeof UsagePatternsSchema>;
export type SubscriptionRecommendation = z.infer<typeof SubscriptionRecommendationSchema>;
export type ChurnFactor = z.infer<typeof ChurnFactorSchema>;
export type RetentionAction = z.infer<typeof RetentionActionSchema>;
export type ChurnRiskAssessment = z.infer<typeof ChurnRiskAssessmentSchema>;
export type PersonalizedOffer = z.infer<typeof PersonalizedOfferSchema>;
export type OptimizationSuggestion = z.infer<typeof OptimizationSuggestionSchema>;
export type UserSegment = z.infer<typeof UserSegmentSchema>;
export type PricingFactor = z.infer<typeof PricingFactorSchema>;
export type DynamicPricing = z.infer<typeof DynamicPricingSchema>;
export type SubscriptionIntelligence = z.infer<typeof SubscriptionIntelligenceSchema>;
export type IntelligenceRequest = z.infer<typeof IntelligenceRequestSchema>;
export type OptimizationRequest = z.infer<typeof OptimizationRequestSchema>;
export type ChurnPredictionRequest = z.infer<typeof ChurnPredictionRequestSchema>;
export type PersonalizedOffersRequest = z.infer<typeof PersonalizedOffersRequestSchema>;
export type UsageOptimizationRequest = z.infer<typeof UsageOptimizationRequestSchema>;
export type OfferActionRequest = z.infer<typeof OfferActionRequestSchema>;
export type FeatureUsage = z.infer<typeof FeatureUsageSchema>;
export type UsageAlert = z.infer<typeof UsageAlertSchema>;
export type BillingPeriod = z.infer<typeof BillingPeriodSchema>;
export type ProjectedCosts = z.infer<typeof ProjectedCostsSchema>;
export type BillingOptimization = z.infer<typeof BillingOptimizationSchema>;
export type UsageBasedBilling = z.infer<typeof UsageBasedBillingSchema>;
export type AnalyticsMetrics = z.infer<typeof AnalyticsMetricsSchema>;
export type PeriodComparison = z.infer<typeof PeriodComparisonSchema>;
export type AnalyticsInsight = z.infer<typeof AnalyticsInsightSchema>;
export type SubscriptionAnalytics = z.infer<typeof SubscriptionAnalyticsSchema>;