import { createClient } from '@/lib/supabase/client';
import {
    AnalyticsDashboardData,
    UserBehaviorAnalytics,
    RevenueAnalytics,
    PerformanceMetrics,
    ConversionAnalytics,
    AnalyticsFilters,
    CustomReport,
    UserInsights,
    AnalyticsOverview,
} from '@/types/analytics';

export class AnalyticsService {
    private supabase = createClient();

    // Get comprehensive dashboard data
    async getDashboardData(filters?: AnalyticsFilters): Promise<AnalyticsDashboardData> {
        const [overview, userBehavior, revenue, performance, conversion] = await Promise.all([
            this.getOverview(filters),
            this.getUserBehaviorAnalytics(filters),
            this.getRevenueAnalytics(filters),
            this.getPerformanceMetrics(filters),
            this.getConversionAnalytics(filters),
        ]);

        return {
            overview,
            userBehavior,
            revenue,
            performance,
            conversion,
        };
    }

    // Get analytics overview
    async getOverview(filters?: AnalyticsFilters): Promise<AnalyticsOverview> {
        const dateFilter = this.buildDateFilter(filters);

        // Get total users
        const { count: totalUsers } = await this.supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', dateFilter.start)
            .lte('created_at', dateFilter.end);

        // Get total revenue
        const { data: revenueData } = await this.supabase
            .from('sales_transactions')
            .select('amount')
            .eq('payment_status', 'completed')
            .gte('created_at', dateFilter.start)
            .lte('created_at', dateFilter.end);

        const totalRevenue = revenueData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;

        // Get total products
        const { count: totalProducts } = await this.supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published')
            .gte('created_at', dateFilter.start)
            .lte('created_at', dateFilter.end);

        // Calculate conversion rate
        const { count: conversions } = await this.supabase
            .from('sales_transactions')
            .select('*', { count: 'exact', head: true })
            .eq('payment_status', 'completed')
            .gte('created_at', dateFilter.start)
            .lte('created_at', dateFilter.end);

        const conversionRate = totalUsers ? (conversions || 0) / totalUsers : 0;

        // Calculate growth rate (compared to previous period)
        const previousPeriodStart = new Date(dateFilter.start);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - (dateFilter.end.getTime() - dateFilter.start.getTime()) / (1000 * 60 * 60 * 24));

        const { count: previousUsers } = await this.supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', previousPeriodStart.toISOString())
            .lt('created_at', dateFilter.start);

        const growthRate = previousUsers ? ((totalUsers || 0) - previousUsers) / previousUsers : 0;

        return {
            totalUsers: totalUsers || 0,
            totalRevenue,
            totalProducts: totalProducts || 0,
            conversionRate,
            growthRate,
            topMetrics: [
                {
                    name: 'Active Users',
                    value: totalUsers || 0,
                    change: growthRate,
                    trend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'stable',
                },
                {
                    name: 'Revenue',
                    value: totalRevenue,
                    change: 0, // TODO: Calculate revenue growth
                    trend: 'up',
                },
                {
                    name: 'Conversion Rate',
                    value: conversionRate * 100,
                    change: 0, // TODO: Calculate conversion rate change
                    trend: 'stable',
                },
            ],
        };
    }

    // Get user behavior analytics
    async getUserBehaviorAnalytics(filters?: AnalyticsFilters): Promise<UserBehaviorAnalytics> {
        // This would typically come from PostHog or similar analytics service
        // For now, we'll return mock data structure
        return {
            sessionDuration: 0,
            pageViews: 0,
            bounceRate: 0,
            topPages: [],
            userJourney: [],
            heatmapData: [],
        };
    }

    // Get revenue analytics
    async getRevenueAnalytics(filters?: AnalyticsFilters): Promise<RevenueAnalytics> {
        const dateFilter = this.buildDateFilter(filters);

        // Get all completed transactions
        const { data: transactions } = await this.supabase
            .from('sales_transactions')
            .select(`
        *,
        products (name, category),
        affiliates (affiliate_code)
      `)
            .eq('payment_status', 'completed')
            .gte('created_at', dateFilter.start)
            .lte('created_at', dateFilter.end);

        if (!transactions) {
            return this.getEmptyRevenueAnalytics();
        }

        const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
        const averageOrderValue = transactions.length > 0 ? totalRevenue / transactions.length : 0;

        // Calculate MRR (Monthly Recurring Revenue)
        const subscriptionTransactions = transactions.filter(t => t.subscription_id);
        const monthlyRecurringRevenue = subscriptionTransactions.reduce((sum, t) => sum + t.amount, 0);

        // Revenue by source
        const revenueBySource = this.calculateRevenueBySource(transactions);

        // Revenue by product
        const revenueByProduct = this.calculateRevenueByProduct(transactions);

        // Revenue growth (monthly)
        const revenueGrowth = await this.calculateRevenueGrowth(dateFilter);

        return {
            totalRevenue,
            monthlyRecurringRevenue,
            averageOrderValue,
            customerLifetimeValue: 0, // TODO: Calculate CLV
            churnRate: 0, // TODO: Calculate churn rate
            conversionRate: 0, // TODO: Calculate conversion rate
            revenueBySource,
            revenueByProduct,
            revenueGrowth,
        };
    }

    // Get performance metrics
    async getPerformanceMetrics(filters?: AnalyticsFilters): Promise<PerformanceMetrics> {
        // This would typically come from PostHog, Google Analytics, or Web Vitals
        // For now, return default values
        return {
            pageLoadTime: 0,
            timeToInteractive: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0,
            firstInputDelay: 0,
            bounceRate: 0,
            sessionDuration: 0,
        };
    }

    // Get conversion analytics
    async getConversionAnalytics(filters?: AnalyticsFilters): Promise<ConversionAnalytics> {
        // This would typically come from PostHog or similar analytics service
        return {
            funnelData: [],
            conversionsBySource: [],
            goalCompletions: [],
            abTestResults: [],
        };
    }

    // Get user insights
    async getUserInsights(filters?: AnalyticsFilters): Promise<UserInsights> {
        const dateFilter = this.buildDateFilter(filters);

        const { count: totalUsers } = await this.supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        const { count: activeUsers } = await this.supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('last_sign_in_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        const { count: newUsers } = await this.supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', dateFilter.start)
            .lte('created_at', dateFilter.end);

        const returningUsers = (totalUsers || 0) - (newUsers || 0);

        return {
            totalUsers: totalUsers || 0,
            activeUsers: activeUsers || 0,
            newUsers: newUsers || 0,
            returningUsers,
            userGrowth: 0, // TODO: Calculate growth
            topPages: [],
            userFlow: [],
            demographics: {
                countries: [],
                cities: [],
                languages: [],
                timezones: [],
            },
            deviceData: [],
        };
    }

    // Create custom report
    async createCustomReport(report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomReport> {
        const { data, error } = await this.supabase
            .from('custom_reports')
            .insert({
                ...report,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            description: data.description,
            metrics: data.metrics,
            dimensions: data.dimensions,
            filters: data.filters,
            schedule: data.schedule,
            format: data.format,
            recipients: data.recipients,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }

    // Get custom reports
    async getCustomReports(): Promise<CustomReport[]> {
        const { data, error } = await this.supabase
            .from('custom_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(report => ({
            id: report.id,
            name: report.name,
            description: report.description,
            metrics: report.metrics,
            dimensions: report.dimensions,
            filters: report.filters,
            schedule: report.schedule,
            format: report.format,
            recipients: report.recipients,
            createdAt: new Date(report.created_at),
            updatedAt: new Date(report.updated_at),
        }));
    }

    // Export analytics data
    async exportData(format: 'csv' | 'json' | 'pdf', filters?: AnalyticsFilters): Promise<string> {
        const data = await this.getDashboardData(filters);

        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return this.convertToCSV(data);
            case 'pdf':
                return this.generatePDFReport(data);
            default:
                throw new Error('Unsupported export format');
        }
    }

    // Helper methods
    private buildDateFilter(filters?: AnalyticsFilters) {
        const defaultEnd = new Date();
        const defaultStart = new Date();
        defaultStart.setDate(defaultStart.getDate() - 30);

        return {
            start: filters?.dateRange?.start?.toISOString() || defaultStart.toISOString(),
            end: filters?.dateRange?.end?.toISOString() || defaultEnd.toISOString(),
        };
    }

    private getEmptyRevenueAnalytics(): RevenueAnalytics {
        return {
            totalRevenue: 0,
            monthlyRecurringRevenue: 0,
            averageOrderValue: 0,
            customerLifetimeValue: 0,
            churnRate: 0,
            conversionRate: 0,
            revenueBySource: [],
            revenueByProduct: [],
            revenueGrowth: [],
        };
    }

    private calculateRevenueBySource(transactions: any[]) {
        const sourceMap = new Map();

        transactions.forEach(transaction => {
            const source = transaction.affiliates?.affiliate_code || 'direct';
            const current = sourceMap.get(source) || 0;
            sourceMap.set(source, current + transaction.amount);
        });

        const total = transactions.reduce((sum, t) => sum + t.amount, 0);

        return Array.from(sourceMap.entries()).map(([source, revenue]) => ({
            source,
            revenue,
            percentage: total > 0 ? (revenue / total) * 100 : 0,
            growth: 0, // TODO: Calculate growth
        }));
    }

    private calculateRevenueByProduct(transactions: any[]) {
        const productMap = new Map();

        transactions.forEach(transaction => {
            const productId = transaction.product_id;
            const productName = transaction.products?.name || 'Unknown';

            if (!productMap.has(productId)) {
                productMap.set(productId, {
                    productId,
                    productName,
                    revenue: 0,
                    units: 0,
                });
            }

            const product = productMap.get(productId);
            product.revenue += transaction.amount;
            product.units += 1;
        });

        return Array.from(productMap.values()).map(product => ({
            ...product,
            averagePrice: product.units > 0 ? product.revenue / product.units : 0,
        }));
    }

    private async calculateRevenueGrowth(dateFilter: { start: string; end: string }) {
        // TODO: Implement monthly revenue growth calculation
        return [];
    }

    private convertToCSV(data: any): string {
        // TODO: Implement CSV conversion
        return 'CSV export not implemented yet';
    }

    private generatePDFReport(data: any): string {
        // TODO: Implement PDF generation
        return 'PDF export not implemented yet';
    }
}

export const analyticsService = new AnalyticsService();