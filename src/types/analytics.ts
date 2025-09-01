export interface AnalyticsEvent {
    event: string;
    properties?: Record<string, any>;
    userId?: string;
    sessionId?: string;
    timestamp?: Date;
}

export interface UserBehaviorData {
    userId: string;
    sessionId: string;
    pageViews: PageView[];
    events: AnalyticsEvent[];
    duration: number;
    bounceRate: number;
    conversionEvents: ConversionEvent[];
}

export interface PageView {
    path: string;
    title: string;
    timestamp: Date;
    duration: number;
    referrer?: string;
    utm?: UTMParameters;
}

export interface ConversionEvent {
    type: 'signup' | 'purchase' | 'subscription' | 'product_creation' | 'affiliate_signup';
    value?: number;
    currency?: string;
    productId?: string;
    timestamp: Date;
    funnel_step?: string;
}

export interface UTMParameters {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
}

export interface RevenueAnalytics {
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    averageOrderValue: number;
    customerLifetimeValue: number;
    churnRate: number;
    conversionRate: number;
    revenueBySource: RevenueBySource[];
    revenueByProduct: RevenueByProduct[];
    revenueGrowth: RevenueGrowthData[];
}

export interface RevenueBySource {
    source: string;
    revenue: number;
    percentage: number;
    growth: number;
}

export interface RevenueByProduct {
    productId: string;
    productName: string;
    revenue: number;
    units: number;
    averagePrice: number;
}

export interface RevenueGrowthData {
    period: string;
    revenue: number;
    growth: number;
    previousPeriod: number;
}

export interface PerformanceMetrics {
    pageLoadTime: number;
    timeToInteractive: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    bounceRate: number;
    sessionDuration: number;
}

export interface UserInsights {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    userGrowth: number;
    topPages: PageInsight[];
    userFlow: UserFlowData[];
    demographics: UserDemographics;
    deviceData: DeviceData[];
}

export interface PageInsight {
    path: string;
    views: number;
    uniqueViews: number;
    averageDuration: number;
    bounceRate: number;
    exitRate: number;
}

export interface UserFlowData {
    from: string;
    to: string;
    users: number;
    dropoffRate: number;
}

export interface UserDemographics {
    countries: CountryData[];
    cities: CityData[];
    languages: LanguageData[];
    timezones: TimezoneData[];
}

export interface CountryData {
    country: string;
    users: number;
    percentage: number;
}

export interface CityData {
    city: string;
    country: string;
    users: number;
    percentage: number;
}

export interface LanguageData {
    language: string;
    users: number;
    percentage: number;
}

export interface TimezoneData {
    timezone: string;
    users: number;
    percentage: number;
}

export interface DeviceData {
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    users: number;
    percentage: number;
}

export interface AnalyticsDashboardData {
    overview: AnalyticsOverview;
    userBehavior: UserBehaviorAnalytics;
    revenue: RevenueAnalytics;
    performance: PerformanceMetrics;
    conversion: ConversionAnalytics;
}

export interface AnalyticsOverview {
    totalUsers: number;
    totalRevenue: number;
    totalProducts: number;
    conversionRate: number;
    growthRate: number;
    topMetrics: TopMetric[];
}

export interface TopMetric {
    name: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
}

export interface UserBehaviorAnalytics {
    sessionDuration: number;
    pageViews: number;
    bounceRate: number;
    topPages: PageInsight[];
    userJourney: UserJourneyStep[];
    heatmapData: HeatmapData[];
}

export interface UserJourneyStep {
    step: string;
    users: number;
    dropoff: number;
    conversionRate: number;
}

export interface HeatmapData {
    x: number;
    y: number;
    value: number;
    element?: string;
}

export interface ConversionAnalytics {
    funnelData: FunnelStep[];
    conversionsBySource: ConversionBySource[];
    goalCompletions: GoalCompletion[];
    abTestResults: ABTestResult[];
}

export interface FunnelStep {
    name: string;
    users: number;
    conversionRate: number;
    dropoffRate: number;
}

export interface ConversionBySource {
    source: string;
    conversions: number;
    rate: number;
    value: number;
}

export interface GoalCompletion {
    goalName: string;
    completions: number;
    value: number;
    conversionRate: number;
}

export interface ABTestResult {
    testName: string;
    variant: string;
    users: number;
    conversionRate: number;
    significance: number;
    winner?: boolean;
}

export interface AnalyticsFilters {
    dateRange: {
        start: Date;
        end: Date;
    };
    userSegment?: string;
    source?: string;
    device?: string;
    country?: string;
    productCategory?: string;
}

export interface CustomReport {
    id: string;
    name: string;
    description: string;
    metrics: string[];
    dimensions: string[];
    filters: AnalyticsFilters;
    schedule?: ReportSchedule;
    format: 'pdf' | 'csv' | 'json';
    recipients: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ReportSchedule {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    timezone: string;
    enabled: boolean;
}