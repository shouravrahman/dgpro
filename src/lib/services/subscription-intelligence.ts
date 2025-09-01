import { createClient } from '@/lib/supabase/server';
import type {
    SubscriptionIntelligence,
    UsagePatterns,
    SubscriptionRecommendation,
    ChurnRiskAssessment,
    PersonalizedOffer,
    OptimizationSuggestion,
    DynamicPricing,
    UsageBasedBilling,
    UserSegment,
    UsageMetric,
    ChurnFactor,
    RetentionAction,
    PricingFactor,
    BillingOptimization,
    UsageAlert,
} from '@/types/subscription-intelligence';

export class SubscriptionIntelligenceService {
    private supabase = createClient();

    /**
     * Generate comprehensive subscription intelligence for a user
     */
    async generateIntelligence(userId: string): Promise<SubscriptionIntelligence> {
        const [usagePatterns, userSegment] = await Promise.all([
            this.analyzeUsagePatterns(userId),
            this.determineUserSegment(userId),
        ]);

        const [recommendations, churnRisk, personalizedOffers, optimizations] = await Promise.all([
            this.generateRecommendations(userId, usagePatterns, userSegment),
            this.assessChurnRisk(userId, usagePatterns, userSegment),
            this.generatePersonalizedOffers(userId, usagePatterns, userSegment),
            this.generateOptimizationSuggestions(userId, usagePatterns),
        ]);

        const { data: user } = await this.supabase
            .from('users')
            .select('subscription_tier')
            .eq('id', userId)
            .single();

        return {
            userId,
            currentTier: (user?.subscription_tier as 'free' | 'pro') || 'free',
            usagePatterns,
            recommendations,
            churnRisk,
            personalizedOffers,
            optimizationSuggestions: optimizations,
        };
    }

    /**
     * Analyze user's usage patterns and trends
     */
    private async analyzeUsagePatterns(userId: string): Promise<UsagePatterns> {
        const { data: user } = await this.supabase
            .from('users')
            .select(`
        subscription_tier,
        usage_ai_requests,
        usage_products,
        usage_marketplace_listings,
        usage_file_uploads,
        usage_storage_bytes,
        created_at
      `)
            .eq('id', userId)
            .single();

        if (!user) {
            throw new Error('User not found');
        }

        const tier = user.subscription_tier || 'free';
        const limits = this.getTierLimits(tier);

        // Get historical usage data (last 8 weeks)
        const historicalData = await this.getHistoricalUsage(userId, 8);

        // Calculate usage metrics
        const aiRequests = this.calculateUsageMetric(
            user.usage_ai_requests || 0,
            limits.aiRequests,
            historicalData.map(d => d.ai_requests || 0)
        );

        const products = this.calculateUsageMetric(
            user.usage_products || 0,
            limits.products,
            historicalData.map(d => d.products || 0)
        );

        const marketplaceListings = this.calculateUsageMetric(
            user.usage_marketplace_listings || 0,
            limits.marketplaceListings,
            historicalData.map(d => d.marketplace_listings || 0)
        );

        const fileUploads = this.calculateUsageMetric(
            user.usage_file_uploads || 0,
            limits.fileUploads,
            historicalData.map(d => d.file_uploads || 0)
        );

        const storage = this.calculateUsageMetric(
            user.usage_storage_bytes || 0,
            limits.storageBytes,
            historicalData.map(d => d.storage_bytes || 0)
        );

        // Calculate activity patterns
        const loginFrequency = await this.calculateLoginFrequency(userId);
        const featureUsage = await this.getFeatureUsage(userId);
        const timeOfDayUsage = await this.getTimeOfDayUsage(userId);
        const weeklyTrends = await this.getWeeklyTrends(userId);

        return {
            aiRequests,
            products,
            marketplaceListings,
            fileUploads,
            storage,
            loginFrequency,
            featureUsage,
            timeOfDayUsage,
            weeklyTrends,
            monthlyGrowth: this.calculateMonthlyGrowth(historicalData),
        };
    }

    /**
     * Calculate usage metric with trends and projections
     */
    private calculateUsageMetric(current: number, limit: number, historical: number[]): UsageMetric {
        const percentage = limit === -1 ? 0 : Math.round((current / limit) * 100);
        const weeklyAverage = historical.slice(-4).reduce((a, b) => a + b, 0) / 4;
        const monthlyAverage = historical.reduce((a, b) => a + b, 0) / historical.length;
        const peakUsage = Math.max(...historical, current);

        // Calculate trend
        const recentAvg = historical.slice(-2).reduce((a, b) => a + b, 0) / 2;
        const olderAvg = historical.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
        let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';

        if (recentAvg > olderAvg * 1.1) trend = 'increasing';
        else if (recentAvg < olderAvg * 0.9) trend = 'decreasing';

        // Project monthly usage based on current trend
        const projectedMonthly = trend === 'increasing'
            ? Math.round(current * 1.3)
            : trend === 'decreasing'
                ? Math.round(current * 0.8)
                : current;

        return {
            current,
            limit,
            percentage,
            trend,
            weeklyAverage,
            monthlyAverage,
            peakUsage,
            projectedMonthly,
        };
    }

    /**
     * Generate intelligent subscription recommendations
     */
    private async generateRecommendations(
        userId: string,
        usagePatterns: UsagePatterns,
        userSegment: UserSegment
    ): Promise<SubscriptionRecommendation[]> {
        const recommendations: SubscriptionRecommendation[] = [];
        const { data: user } = await this.supabase
            .from('users')
            .select('subscription_tier, created_at')
            .eq('id', userId)
            .single();

        const currentTier = user?.subscription_tier || 'free';
        const accountAge = user?.created_at ?
            Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

        // Upgrade recommendation logic
        if (currentTier === 'free') {
            const shouldUpgrade = this.shouldRecommendUpgrade(usagePatterns, userSegment, accountAge);
            if (shouldUpgrade.recommend) {
                recommendations.push({
                    type: 'upgrade',
                    tier: 'pro',
                    interval: shouldUpgrade.preferredInterval,
                    confidence: shouldUpgrade.confidence,
                    reasoning: shouldUpgrade.reasoning,
                    potentialValue: shouldUpgrade.potentialValue,
                    urgency: shouldUpgrade.urgency,
                    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                });
            }
        }

        // Downgrade recommendation (if applicable)
        if (currentTier === 'pro') {
            const shouldDowngrade = this.shouldRecommendDowngrade(usagePatterns, userSegment);
            if (shouldDowngrade.recommend) {
                recommendations.push({
                    type: 'downgrade',
                    tier: 'free',
                    confidence: shouldDowngrade.confidence,
                    reasoning: shouldDowngrade.reasoning,
                    potentialSavings: shouldDowngrade.potentialSavings,
                    urgency: 'low',
                    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                });
            }
        }

        // Pause recommendation for inactive users
        const shouldPause = this.shouldRecommendPause(usagePatterns, userSegment);
        if (shouldPause.recommend) {
            recommendations.push({
                type: 'pause',
                tier: currentTier as 'free' | 'pro',
                confidence: shouldPause.confidence,
                reasoning: shouldPause.reasoning,
                potentialSavings: shouldPause.potentialSavings,
                urgency: 'medium',
                validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            });
        }

        return recommendations.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * Assess churn risk and generate retention actions
     */
    private async assessChurnRisk(
        userId: string,
        usagePatterns: UsagePatterns,
        userSegment: UserSegment
    ): Promise<ChurnRiskAssessment> {
        const factors: ChurnFactor[] = [];
        let riskScore = 0;

        // Usage decline factor
        const usageDecline = this.calculateUsageDecline(usagePatterns);
        if (usageDecline > 0.3) {
            factors.push({
                factor: 'usage_decline',
                impact: 'negative',
                weight: 0.3,
                description: `Usage has declined by ${Math.round(usageDecline * 100)}% recently`,
            });
            riskScore += 30;
        }

        // Login frequency factor
        if (usagePatterns.loginFrequency < 2) {
            factors.push({
                factor: 'low_engagement',
                impact: 'negative',
                weight: 0.25,
                description: `User logs in only ${usagePatterns.loginFrequency} times per week`,
            });
            riskScore += 25;
        }

        // Feature utilization factor
        const featureUtilization = Object.keys(usagePatterns.featureUsage).length;
        if (featureUtilization < 3) {
            factors.push({
                factor: 'limited_feature_usage',
                impact: 'negative',
                weight: 0.2,
                description: `User only uses ${featureUtilization} features regularly`,
            });
            riskScore += 20;
        }

        // Positive factors
        if (usagePatterns.monthlyGrowth > 0.1) {
            factors.push({
                factor: 'growing_usage',
                impact: 'positive',
                weight: -0.2,
                description: `Usage is growing by ${Math.round(usagePatterns.monthlyGrowth * 100)}% monthly`,
            });
            riskScore -= 15;
        }

        // Determine risk level
        let riskLevel: 'low' | 'medium' | 'high' | 'critical';
        if (riskScore >= 70) riskLevel = 'critical';
        else if (riskScore >= 50) riskLevel = 'high';
        else if (riskScore >= 30) riskLevel = 'medium';
        else riskLevel = 'low';

        // Generate retention actions
        const retentionActions = this.generateRetentionActions(riskLevel, factors, userSegment);

        return {
            riskLevel,
            score: Math.min(100, Math.max(0, riskScore)),
            factors,
            retentionActions,
            timeToChurn: riskLevel === 'critical' ? 7 : riskLevel === 'high' ? 30 : undefined,
            confidence: 85,
        };
    }

    /**
     * Generate personalized offers based on user behavior
     */
    private async generatePersonalizedOffers(
        userId: string,
        usagePatterns: UsagePatterns,
        userSegment: UserSegment
    ): Promise<PersonalizedOffer[]> {
        const offers: PersonalizedOffer[] = [];
        const { data: user } = await this.supabase
            .from('users')
            .select('subscription_tier, created_at')
            .eq('id', userId)
            .single();

        const currentTier = user?.subscription_tier || 'free';
        const accountAge = user?.created_at ?
            Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

        // New user discount
        if (accountAge < 30 && currentTier === 'free') {
            offers.push({
                id: `new-user-${userId}`,
                type: 'discount',
                title: 'New User Special: 50% Off Pro Plan',
                description: 'Get 50% off your first month of Pro to unlock unlimited features',
                value: 50,
                originalPrice: 29,
                discountedPrice: 14.50,
                discountPercentage: 50,
                validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                conditions: ['Valid for first-time Pro subscribers only'],
                targetSegment: userSegment.type,
                priority: 'high',
                estimatedConversion: 25,
            });
        }

        // Heavy usage bonus credits
        if (this.isHeavyUser(usagePatterns) && currentTier === 'free') {
            offers.push({
                id: `heavy-user-${userId}`,
                type: 'bonus_credits',
                title: 'Power User Bonus: Extra AI Credits',
                description: 'Get 50 bonus AI requests this month for being an active user',
                value: 50,
                validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                targetSegment: userSegment.type,
                priority: 'medium',
                estimatedConversion: 40,
            });
        }

        // Churn prevention offer
        if (userSegment.type === 'at_risk' && currentTier === 'pro') {
            offers.push({
                id: `retention-${userId}`,
                type: 'discount',
                title: 'We Miss You: 3 Months for $19/month',
                description: 'Special pricing to keep you as a valued Pro member',
                value: 34,
                originalPrice: 29,
                discountedPrice: 19,
                discountPercentage: 34,
                validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                conditions: ['Valid for 3 months only', 'Cannot be combined with other offers'],
                targetSegment: userSegment.type,
                priority: 'high',
                estimatedConversion: 60,
            });
        }

        return offers.sort((a, b) => b.priority.localeCompare(a.priority));
    }

    /**
     * Generate optimization suggestions
     */
    private async generateOptimizationSuggestions(
        userId: string,
        usagePatterns: UsagePatterns
    ): Promise<OptimizationSuggestion[]> {
        const suggestions: OptimizationSuggestion[] = [];

        // Usage optimization
        if (usagePatterns.aiRequests.percentage > 80) {
            suggestions.push({
                type: 'usage',
                title: 'Optimize AI Request Usage',
                description: 'You\'re using 80%+ of your AI requests. Consider batching requests or upgrading.',
                impact: 'limit_optimization',
                difficulty: 'easy',
                estimatedTime: '5 minutes',
                steps: [
                    'Batch multiple questions into single requests',
                    'Use templates for common queries',
                    'Consider upgrading to Pro for unlimited requests',
                ],
            });
        }

        // Feature discovery
        const unusedFeatures = this.getUnusedFeatures(usagePatterns.featureUsage);
        if (unusedFeatures.length > 0) {
            suggestions.push({
                type: 'features',
                title: 'Discover Unused Features',
                description: `You haven't used ${unusedFeatures.length} powerful features that could boost your productivity.`,
                impact: 'feature_discovery',
                potentialValue: 100,
                difficulty: 'easy',
                estimatedTime: '10 minutes',
                steps: unusedFeatures.map(feature => `Try the ${feature} feature`),
            });
        }

        // Workflow optimization
        if (usagePatterns.timeOfDayUsage) {
            const peakHour = Object.entries(usagePatterns.timeOfDayUsage)
                .sort(([, a], [, b]) => b - a)[0];

            if (peakHour) {
                suggestions.push({
                    type: 'workflow',
                    title: 'Optimize Your Work Schedule',
                    description: `You're most active at ${peakHour[0]}:00. Schedule important tasks during peak hours.`,
                    impact: 'efficiency',
                    difficulty: 'easy',
                    estimatedTime: 'Ongoing',
                });
            }
        }

        return suggestions;
    }

    /**
     * Generate dynamic pricing for user
     */
    async generateDynamicPricing(userId: string): Promise<DynamicPricing> {
        const [usagePatterns, userSegment] = await Promise.all([
            this.analyzeUsagePatterns(userId),
            this.determineUserSegment(userId),
        ]);

        const basePrice = 29; // Pro plan base price
        const factors: PricingFactor[] = [];
        let adjustmentFactor = 1.0;

        // New user discount
        if (userSegment.type === 'new_user') {
            factors.push({
                factor: 'new_user_discount',
                adjustment: 0.7, // 30% discount
                reasoning: 'First-time user incentive',
            });
            adjustmentFactor *= 0.7;
        }

        // High usage premium
        if (userSegment.type === 'power_user') {
            factors.push({
                factor: 'power_user_value',
                adjustment: 1.0, // No change, they get full value
                reasoning: 'High usage justifies full price',
            });
        }

        // Price sensitive segment
        if (userSegment.type === 'price_sensitive') {
            factors.push({
                factor: 'price_sensitivity',
                adjustment: 0.8, // 20% discount
                reasoning: 'Price-sensitive user retention',
            });
            adjustmentFactor *= 0.8;
        }

        // At-risk user retention pricing
        if (userSegment.type === 'at_risk') {
            factors.push({
                factor: 'retention_pricing',
                adjustment: 0.65, // 35% discount
                reasoning: 'Churn prevention pricing',
            });
            adjustmentFactor *= 0.65;
        }

        return {
            userId,
            basePrice,
            adjustedPrice: Math.round(basePrice * adjustmentFactor * 100) / 100,
            adjustmentFactor,
            reasoning: factors,
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            segment: userSegment,
        };
    }

    // Helper methods
    private getTierLimits(tier: string) {
        const limits = {
            free: {
                aiRequests: 10,
                products: 3,
                marketplaceListings: 1,
                fileUploads: 5,
                storageBytes: 100 * 1024 * 1024,
            },
            pro: {
                aiRequests: -1,
                products: -1,
                marketplaceListings: -1,
                fileUploads: -1,
                storageBytes: 10 * 1024 * 1024 * 1024,
            },
        };
        return limits[tier as keyof typeof limits] || limits.free;
    }

    private async getHistoricalUsage(userId: string, weeks: number) {
        // This would typically query a usage_history table
        // For now, return mock data
        return Array.from({ length: weeks }, (_, i) => ({
            week: i,
            ai_requests: Math.floor(Math.random() * 20),
            products: Math.floor(Math.random() * 5),
            marketplace_listings: Math.floor(Math.random() * 3),
            file_uploads: Math.floor(Math.random() * 10),
            storage_bytes: Math.floor(Math.random() * 1000000),
        }));
    }

    private async calculateLoginFrequency(userId: string): Promise<number> {
        // This would query auth logs or session data
        // For now, return a reasonable estimate
        return Math.random() * 7; // 0-7 days per week
    }

    private async getFeatureUsage(userId: string): Promise<Record<string, number>> {
        // This would query feature usage analytics
        return {
            'ai_scraping': Math.floor(Math.random() * 50),
            'product_creation': Math.floor(Math.random() * 20),
            'marketplace_listing': Math.floor(Math.random() * 10),
            'analytics_dashboard': Math.floor(Math.random() * 30),
        };
    }

    private async getTimeOfDayUsage(userId: string): Promise<Record<string, number>> {
        // This would query usage by hour
        const usage: Record<string, number> = {};
        for (let hour = 0; hour < 24; hour++) {
            usage[hour.toString()] = Math.floor(Math.random() * 10);
        }
        return usage;
    }

    private async getWeeklyTrends(userId: string) {
        // This would query weekly aggregated data
        return Array.from({ length: 8 }, (_, i) => ({
            week: `2024-W${50 - i}`,
            usage: {
                ai_requests: Math.floor(Math.random() * 20),
                products: Math.floor(Math.random() * 5),
            },
            totalActivity: Math.floor(Math.random() * 100),
        }));
    }

    private calculateMonthlyGrowth(historical: any[]): number {
        if (historical.length < 4) return 0;
        const recent = historical.slice(-4).reduce((sum, week) => sum + week.ai_requests, 0);
        const older = historical.slice(0, 4).reduce((sum, week) => sum + week.ai_requests, 0);
        return older > 0 ? (recent - older) / older : 0;
    }

    private async determineUserSegment(userId: string): Promise<UserSegment> {
        const { data: user } = await this.supabase
            .from('users')
            .select('created_at, subscription_tier, usage_ai_requests')
            .eq('id', userId)
            .single();

        if (!user) {
            throw new Error('User not found');
        }

        const accountAge = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
        const usage = user.usage_ai_requests || 0;

        if (accountAge < 30) {
            return {
                type: 'new_user',
                characteristics: ['Recently joined', 'Exploring features'],
                typicalBehavior: ['High initial activity', 'Feature discovery'],
                recommendedStrategy: 'Onboarding and education focus',
            };
        }

        if (usage > 50) {
            return {
                type: 'power_user',
                characteristics: ['High usage', 'Feature adoption'],
                typicalBehavior: ['Regular usage', 'Advanced features'],
                recommendedStrategy: 'Value reinforcement and advanced features',
            };
        }

        return {
            type: 'casual_user',
            characteristics: ['Moderate usage', 'Basic features'],
            typicalBehavior: ['Occasional usage', 'Simple workflows'],
            recommendedStrategy: 'Engagement and feature discovery',
        };
    }

    private shouldRecommendUpgrade(usagePatterns: UsagePatterns, userSegment: UserSegment, accountAge: number) {
        const reasons: string[] = [];
        let confidence = 0;
        let urgency: 'low' | 'medium' | 'high' = 'low';

        // High usage indicators
        if (usagePatterns.aiRequests.percentage > 80) {
            reasons.push('You\'re using 80%+ of your AI request limit');
            confidence += 30;
            urgency = 'high';
        }

        if (usagePatterns.products.percentage > 70) {
            reasons.push('You\'re approaching your product creation limit');
            confidence += 25;
        }

        // Growth indicators
        if (usagePatterns.monthlyGrowth > 0.2) {
            reasons.push('Your usage is growing rapidly (+20% monthly)');
            confidence += 20;
        }

        // Engagement indicators
        if (usagePatterns.loginFrequency > 4) {
            reasons.push('You\'re highly engaged (4+ logins per week)');
            confidence += 15;
        }

        // Account maturity
        if (accountAge > 14) {
            reasons.push('You\'ve been using the platform for 2+ weeks');
            confidence += 10;
        }

        return {
            recommend: confidence >= 40,
            confidence,
            reasoning: reasons,
            urgency,
            preferredInterval: userSegment.type === 'price_sensitive' ? 'yearly' : 'monthly',
            potentialValue: 200, // Estimated monthly value from unlimited features
        };
    }

    private shouldRecommendDowngrade(usagePatterns: UsagePatterns, userSegment: UserSegment) {
        const reasons: string[] = [];
        let confidence = 0;

        // Low usage indicators
        if (usagePatterns.aiRequests.current < 5) {
            reasons.push('You\'re using very few AI requests');
            confidence += 30;
        }

        if (usagePatterns.loginFrequency < 1) {
            reasons.push('Low engagement (less than 1 login per week)');
            confidence += 25;
        }

        if (Object.keys(usagePatterns.featureUsage).length < 2) {
            reasons.push('Limited feature usage');
            confidence += 20;
        }

        return {
            recommend: confidence >= 50,
            confidence,
            reasoning: reasons,
            potentialSavings: 29, // Monthly Pro cost
        };
    }

    private shouldRecommendPause(usagePatterns: UsagePatterns, userSegment: UserSegment) {
        const reasons: string[] = [];
        let confidence = 0;

        if (usagePatterns.loginFrequency < 0.5) {
            reasons.push('Very low activity (less than 2 logins per month)');
            confidence += 40;
        }

        if (usagePatterns.aiRequests.current === 0) {
            reasons.push('No AI requests this month');
            confidence += 30;
        }

        return {
            recommend: confidence >= 50,
            confidence,
            reasoning: reasons,
            potentialSavings: 29,
        };
    }

    private calculateUsageDecline(usagePatterns: UsagePatterns): number {
        // Calculate overall usage decline based on trends
        const metrics = [
            usagePatterns.aiRequests,
            usagePatterns.products,
            usagePatterns.marketplaceListings,
            usagePatterns.fileUploads,
        ];

        const decliningMetrics = metrics.filter(m => m.trend === 'decreasing').length;
        return decliningMetrics / metrics.length;
    }

    private generateRetentionActions(
        riskLevel: string,
        factors: ChurnFactor[],
        userSegment: UserSegment
    ): RetentionAction[] {
        const actions: RetentionAction[] = [];

        if (riskLevel === 'high' || riskLevel === 'critical') {
            actions.push({
                type: 'discount',
                title: 'Special Retention Offer',
                description: '50% off next 3 months to keep you as a valued member',
                priority: 'high',
                estimatedImpact: 60,
                cost: 43.50, // 3 months at 50% off
            });
        }

        if (factors.some(f => f.factor === 'limited_feature_usage')) {
            actions.push({
                type: 'education',
                title: 'Personal Feature Tour',
                description: 'One-on-one session to show you powerful features you haven\'t tried',
                priority: 'medium',
                estimatedImpact: 40,
            });
        }

        if (factors.some(f => f.factor === 'low_engagement')) {
            actions.push({
                type: 'support',
                title: 'Check-in Call',
                description: 'Personal call to understand your needs and help optimize your workflow',
                priority: 'medium',
                estimatedImpact: 35,
            });
        }

        return actions;
    }

    private isHeavyUser(usagePatterns: UsagePatterns): boolean {
        return usagePatterns.aiRequests.percentage > 70 ||
            usagePatterns.products.percentage > 70 ||
            usagePatterns.loginFrequency > 5;
    }

    private getUnusedFeatures(featureUsage: Record<string, number>): string[] {
        const allFeatures = [
            'AI Scraping',
            'Product Creation',
            'Marketplace Listing',
            'Analytics Dashboard',
            'Bulk Operations',
            'Custom Branding',
            'Advanced Analytics',
        ];

        return allFeatures.filter(feature =>
            !featureUsage[feature.toLowerCase().replace(' ', '_')] ||
            featureUsage[feature.toLowerCase().replace(' ', '_')] === 0
        );
    }
}