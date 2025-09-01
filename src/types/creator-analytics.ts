export interface CreatorAnalyticsData {
    overview: CreatorOverview;
    products: CreatorProductAnalytics;
    revenue: CreatorRevenueAnalytics;
    audience: CreatorAudienceAnalytics;
    performance: CreatorPerformanceMetrics;
}

export interface CreatorOverview {
    totalProducts: number;
    totalRevenue: number;
    totalSales: number;
    totalViews: number;
    conversionRate: number;
    averageRating: number;
    followerCount: number;
    growthRate: number;
    topMetrics: CreatorTopMetric[];
}

export interface CreatorTopMetric {
    name: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
}

export interface CreatorProductAnalytics {
    topProducts: CreatorProduct[];
    productPerformance: ProductPerformance[];
    categoryBreakdown: CategoryBreakdown[];
    recentProducts: CreatorProduct[];
}

export interface CreatorProduct {
    id: string;
    name: string;
    category: string;
    price: number;
    sales: number;
    revenue: number;
    views: number;
    conversionRate: number;
    rating: number;
    reviewCount: number;
    createdAt: Date;
    status: 'active' | 'draft' | 'archived';
}

export interface ProductPerformance {
    productId: string;
    productName: string;
    views: number;
    sales: number;
    revenue: number;
    conversionRate: number;
    trend: 'up' | 'down' | 'stable';
}

export interface CategoryBreakdown {
    category: string;
    productCount: number;
    revenue: number;
    sales: number;
    averagePrice: number;
}

export interface CreatorRevenueAnalytics {
    totalRevenue: number;
    monthlyRevenue: number;
    revenueGrowth: RevenueGrowthData[];
    revenueByProduct: RevenueByProduct[];
    revenueByMonth: MonthlyRevenue[];
    payoutHistory: PayoutRecord[];
    pendingPayouts: number;
    nextPayoutDate: Date;
}

export interface RevenueGrowthData {
    period: string;
    revenue: number;
    growth: number;
    sales: number;
}

export interface RevenueByProduct {
    productId: string;
    productName: string;
    revenue: number;
    sales: number;
    percentage: number;
}

export interface MonthlyRevenue {
    month: string;
    revenue: number;
    sales: number;
    growth: number;
}

export interface PayoutRecord {
    id: string;
    amount: number;
    date: Date;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    method: string;
}

export interface CreatorAudienceAnalytics {
    totalFollowers: number;
    followerGrowth: FollowerGrowthData[];
    audienceDemographics: AudienceDemographics;
    engagementMetrics: EngagementMetrics;
    topReferrers: ReferrerData[];
}

export interface FollowerGrowthData {
    date: string;
    followers: number;
    growth: number;
}

export interface AudienceDemographics {
    countries: CountryData[];
    ageGroups: AgeGroupData[];
    interests: InterestData[];
}

export interface CountryData {
    country: string;
    followers: number;
    percentage: number;
}

export interface AgeGroupData {
    ageGroup: string;
    followers: number;
    percentage: number;
}

export interface InterestData {
    interest: string;
    followers: number;
    percentage: number;
}

export interface EngagementMetrics {
    averageEngagementRate: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    engagementTrend: EngagementTrendData[];
}

export interface EngagementTrendData {
    date: string;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
}

export interface ReferrerData {
    source: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
}

export interface CreatorPerformanceMetrics {
    productViews: number;
    profileViews: number;
    searchAppearances: number;
    clickThroughRate: number;
    bounceRate: number;
    averageSessionDuration: number;
    topPerformingContent: TopContent[];
}

export interface TopContent {
    id: string;
    title: string;
    type: 'product' | 'post' | 'video';
    views: number;
    engagement: number;
    conversionRate: number;
}

export interface CreatorAnalyticsFilters {
    dateRange: {
        start: Date;
        end: Date;
    };
    productCategory?: string;
    productStatus?: 'active' | 'draft' | 'archived';
    metric?: string;
}

export interface CreatorGoal {
    id: string;
    name: string;
    type: 'revenue' | 'sales' | 'followers' | 'products';
    target: number;
    current: number;
    deadline: Date;
    status: 'active' | 'completed' | 'paused';
}

export interface CreatorInsight {
    id: string;
    type: 'opportunity' | 'warning' | 'achievement' | 'tip';
    title: string;
    description: string;
    actionable: boolean;
    priority: 'high' | 'medium' | 'low';
    createdAt: Date;
}

export interface CreatorCompetitorAnalysis {
    competitorCount: number;
    marketPosition: number;
    averagePrice: number;
    priceComparison: 'above' | 'below' | 'average';
    strengthAreas: string[];
    improvementAreas: string[];
}

export interface CreatorRecommendation {
    id: string;
    type: 'pricing' | 'marketing' | 'product' | 'content';
    title: string;
    description: string;
    expectedImpact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    priority: number;
}