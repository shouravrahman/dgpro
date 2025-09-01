// Subscription Intelligence System Types

export interface SubscriptionIntelligence {
    userId: string;
    currentTier: 'free' | 'pro';
    usagePatterns: UsagePatterns;
    recommendations: SubscriptionRecommendation[];
    churnRisk: ChurnRiskAssessment;
    personalizedOffers: PersonalizedOffer[];
    optimizationSuggestions: OptimizationSuggestion[];
}

export interface UsagePatterns {
    aiRequests: UsageMetric;
    products: UsageMetric;
    marketplaceListings: UsageMetric;
    fileUploads: UsageMetric;
    storage: UsageMetric;
    loginFrequency: number; // days per week
    featureUsage: Record<string, number>; // feature -> usage count
    timeOfDayUsage: Record<string, number>; // hour -> usage count
    weeklyTrends: WeeklyTrend[];
    monthlyGrowth: number; // percentage
}

export interface UsageMetric {
    current: number;
    limit: number;
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    weeklyAverage: number;
    monthlyAverage: number;
    peakUsage: number;
    projectedMonthly: number;
}

export interface WeeklyTrend {
    week: string; // ISO week
    usage: Record<string, number>;
    totalActivity: number;
}

export interface SubscriptionRecommendation {
    type: 'upgrade' | 'downgrade' | 'maintain' | 'pause';
    tier: 'free' | 'pro';
    interval?: 'monthly' | 'yearly';
    confidence: number; // 0-100
    reasoning: string[];
    potentialSavings?: number;
    potentialValue?: number;
    urgency: 'low' | 'medium' | 'high';
    validUntil: string;
}

export interface ChurnRiskAssessment {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    score: number; // 0-100
    factors: ChurnFactor[];
    retentionActions: RetentionAction[];
    timeToChurn?: number; // days
    confidence: number;
}

export interface ChurnFactor {
    factor: string;
    impact: 'positive' | 'negative';
    weight: number;
    description: string;
}

export interface RetentionAction {
    type: 'discount' | 'feature_unlock' | 'support' | 'education' | 'pause_option';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimatedImpact: number; // percentage reduction in churn risk
    cost?: number;
}

export interface PersonalizedOffer {
    id: string;
    type: 'discount' | 'trial_extension' | 'feature_unlock' | 'bonus_credits';
    title: string;
    description: string;
    value: number;
    originalPrice?: number;
    discountedPrice?: number;
    discountPercentage?: number;
    validUntil: string;
    conditions?: string[];
    targetSegment: string;
    priority: 'low' | 'medium' | 'high';
    estimatedConversion: number; // percentage
}

export interface OptimizationSuggestion {
    type: 'usage' | 'billing' | 'features' | 'workflow';
    title: string;
    description: string;
    impact: 'cost_saving' | 'efficiency' | 'feature_discovery' | 'limit_optimization';
    potentialSavings?: number;
    potentialValue?: number;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime?: string;
    steps?: string[];
}

export interface DynamicPricing {
    userId: string;
    basePrice: number;
    adjustedPrice: number;
    adjustmentFactor: number;
    reasoning: PricingFactor[];
    validUntil: string;
    segment: UserSegment;
}

export interface PricingFactor {
    factor: string;
    adjustment: number; // multiplier (1.0 = no change, 0.8 = 20% discount, 1.2 = 20% premium)
    reasoning: string;
}

export interface UserSegment {
    type: 'new_user' | 'power_user' | 'casual_user' | 'at_risk' | 'high_value' | 'price_sensitive';
    characteristics: string[];
    typicalBehavior: string[];
    recommendedStrategy: string;
}

export interface UsageBasedBilling {
    userId: string;
    currentPeriod: BillingPeriod;
    projectedCosts: ProjectedCosts;
    optimizations: BillingOptimization[];
    alerts: UsageAlert[];
}

export interface BillingPeriod {
    start: string;
    end: string;
    baseCost: number;
    usageCosts: Record<string, number>;
    totalCost: number;
    projectedTotal: number;
}

export interface ProjectedCosts {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
    confidence: number;
    factors: string[];
}

export interface BillingOptimization {
    type: 'plan_change' | 'usage_reduction' | 'timing_optimization' | 'feature_substitution';
    title: string;
    description: string;
    potentialSavings: number;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    implementation: string[];
}

export interface UsageAlert {
    type: 'approaching_limit' | 'unusual_spike' | 'cost_increase' | 'optimization_opportunity';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
    threshold?: number;
    currentValue?: number;
    suggestedActions: string[];
    createdAt: string;
}

export interface SubscriptionAnalytics {
    userId: string;
    period: string;
    metrics: AnalyticsMetrics;
    comparisons: PeriodComparison[];
    insights: AnalyticsInsight[];
}

export interface AnalyticsMetrics {
    totalSpent: number;
    valueReceived: number;
    roi: number;
    efficiencyScore: number;
    featureUtilization: Record<string, number>;
    costPerFeature: Record<string, number>;
    timeToValue: number; // days
}

export interface PeriodComparison {
    period: string;
    metric: string;
    previousValue: number;
    currentValue: number;
    change: number;
    changePercentage: number;
    trend: 'improving' | 'declining' | 'stable';
}

export interface AnalyticsInsight {
    type: 'cost_efficiency' | 'feature_usage' | 'value_realization' | 'optimization';
    title: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    actionable: boolean;
    recommendations?: string[];
}

// API Request/Response Types
export interface IntelligenceRequest {
    userId: string;
    includeRecommendations?: boolean;
    includeChurnAnalysis?: boolean;
    includePersonalizedOffers?: boolean;
    includeDynamicPricing?: boolean;
    timeframe?: 'week' | 'month' | 'quarter' | 'year';
}

export interface IntelligenceResponse {
    success: boolean;
    data?: SubscriptionIntelligence;
    error?: string;
}

export interface OptimizationRequest {
    userId: string;
    currentUsage: Record<string, number>;
    goals?: string[];
    constraints?: string[];
}

export interface OptimizationResponse {
    success: boolean;
    data?: {
        recommendations: SubscriptionRecommendation[];
        optimizations: BillingOptimization[];
        projectedSavings: number;
    };
    error?: string;
}

export interface ChurnPredictionRequest {
    userId: string;
    includeRetentionActions?: boolean;
    timeHorizon?: number; // days
}

export interface ChurnPredictionResponse {
    success: boolean;
    data?: ChurnRiskAssessment;
    error?: string;
}

export interface PersonalizedOffersRequest {
    userId: string;
    offerTypes?: PersonalizedOffer['type'][];
    maxOffers?: number;
}

export interface PersonalizedOffersResponse {
    success: boolean;
    data?: PersonalizedOffer[];
    error?: string;
}