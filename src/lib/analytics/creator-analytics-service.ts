import { createClient } from '@/lib/supabase/client';
import {
    CreatorAnalyticsData,
    CreatorOverview,
    CreatorProductAnalytics,
    CreatorRevenueAnalytics,
    CreatorAudienceAnalytics,
    CreatorPerformanceMetrics,
    CreatorAnalyticsFilters,
    CreatorGoal,
    CreatorInsight,
    CreatorRecommendation,
} from '@/types/creator-analytics';

export class CreatorAnalyticsService {
    private supabase = createClient();

    // Get comprehensive creator analytics data
    async getCreatorAnalytics(creatorId: string, filters?: CreatorAnalyticsFilters): Promise<CreatorAnalyticsData> {
        const [overview, products, revenue, audience, performance] = await Promise.all([
            this.getCreatorOverview(creatorId, filters),
            this.getProductAnalytics(creatorId, filters),
            this.getRevenueAnalytics(creatorId, filters),
            this.getAudienceAnalytics(creatorId, filters),
            this.getPerformanceMetrics(creatorId, filters),
        ]);

        return {
            overview,
            products,
            revenue,
            audience,
            performance,
        };
    }

    // Get creator overview metrics
    async getCreatorOverview(creatorId: string, filters?: CreatorAnalyticsFilters): Promise<CreatorOverview> {
        const dateFilter = this.buildDateFilter(filters);

        // Get total products
        const { count: totalProducts } = await this.supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('creator_id', creatorId)
            .eq('status', 'published');

        // Get total sales and revenue
        const { data: salesData } = await this.supabase
            .from('sales_transactions')
            .select(`
        amount,
        products!inner(creator_id)
      `)
            .eq('products.creator_id', creatorId)
            .eq('payment_status', 'completed')
            .gte('created_at', dateFilter.start)
            .lte('created_at', dateFilter.end);

        const totalRevenue = salesData?.reduce((sum, sale) => sum + sale.amount, 0) || 0;
        const totalSales = salesData?.length || 0;

        // Get total views (from page_views table)
        const { data: viewsData } = await this.supabase
            .from('page_views')
            .select('*')
            .like('page_path', `/creator/${creatorId}%`)
            .gte('created_at', dateFilter.start)
            .lte('created_at', dateFilter.end);

        const totalViews = viewsData?.length || 0;

        // Calculate conversion rate
        const conversionRate = totalViews > 0 ? totalSales / totalViews : 0;

        // Get average rating
        const { data: ratingsData } = await this.supabase
            .from('product_reviews')
            .select(`
        rating,
        products!inner(creator_id)
      `)
            .eq('products.creator_id', creatorId);

        const averageRating = ratingsData?.length
            ? ratingsData.reduce((sum, review) => sum + review.rating, 0) / ratingsData.length
            : 0;

        // Get follower count
        const { count: followerCount } = await this.supabase
            .from('user_follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', creatorId);

        // Calculate growth rate (compared to previous period)
        const previousPeriodStart = new Date(dateFilter.start);
        const periodLength = dateFilter.end.getTime() - dateFilter.start.getTime();
        previousPeriodStart.setTime(previousPeriodStart.getTime() - periodLength);

        const { data: previousSalesData } = await this.supabase
            .from('sales_transactions')
            .select(`
        amount,
        products!inner(creator_id)
      `)
            .eq('products.creator_id', creatorId)
            .eq('payment_status', 'completed')
            .gte('created_at', previousPeriodStart.toISOString())
            .lt('created_at', dateFilter.start);

        const previousRevenue = previousSalesData?.reduce((sum, sale) => sum + sale.amount, 0) || 0;
        const growthRate = previousRevenue > 0 ? (totalRevenue - previousRevenue) / previousRevenue : 0;

        return {
            totalProducts: totalProducts || 0,
            totalRevenue,
            totalSales,
            totalViews,
            conversionRate,
            averageRating,
            followerCount: followerCount || 0,
            growthRate,
            topMetrics: [
                {
                    name: 'Revenue',
                    value: totalRevenue,
                    change: growthRate,
                    trend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'stable',
                },
                {
                    name: 'Sales',
                    value: totalSales,
                    change: 0, // TODO: Calculate sales growth
                    trend: 'stable',
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

    // Get product analytics
    async getProductAnalytics(creatorId: string, filters?: CreatorAnalyticsFilters): CreatorProductAnalytics {
        const dateFilter = this.buildDateFilter(filters);

        // Get all creator products with sales data
        const { data: products } = await this.supabase
            .from('products')
            .select(`
        *,
        sales_transactions(amount, created_at),
        product_reviews(rating)
      `)
            .eq('creator_id', creatorId)
            .order('created_at', { ascending: false });

        if (!products) {
            return {
                topProducts: [],
                productPerformance: [],
                categoryBreakdown: [],
                recentProducts: [],
            };
        }

        // Process products data
        const processedProducts = products.map(product => {
            const sales = product.sales_transactions?.filter(sale =>
                new Date(sale.created_at) >= new Date(dateFilter.start) &&
                new Date(sale.created_at) <= new Date(dateFilter.end)
            ) || [];

            const revenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
            const salesCount = sales.length;
            const rating = product.product_reviews?.length
                ? product.product_reviews.reduce((sum, review) => sum + review.rating, 0) / product.product_reviews.length
                : 0;

            return {
                id: product.id,
                name: product.name,
                category: product.category || 'Uncategorized',
                price: product.price,
                sales: salesCount,
                revenue,
                views: 0, // TODO: Get from page_views
                conversionRate: 0, // TODO: Calculate
                rating,
                reviewCount: product.product_reviews?.length || 0,
                createdAt: new Date(product.created_at),
                status: product.status,
            };
        });

        // Sort by revenue for top products
        const topProducts = [...processedProducts]
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        // Create performance data
        const productPerformance = processedProducts.map(product => ({
            productId: product.id,
            productName: product.name,
            views: product.views,
            sales: product.sales,
            revenue: product.revenue,
            conversionRate: product.conversionRate,
            trend: 'stable' as const, // TODO: Calculate trend
        }));

        // Category breakdown
        const categoryMap = new Map();
        processedProducts.forEach(product => {
            const category = product.category;
            if (!categoryMap.has(category)) {
                categoryMap.set(category, {
                    category,
                    productCount: 0,
                    revenue: 0,
                    sales: 0,
                    totalPrice: 0,
                });
            }
            const categoryData = categoryMap.get(category);
            categoryData.productCount += 1;
            categoryData.revenue += product.revenue;
            categoryData.sales += product.sales;
            categoryData.totalPrice += product.price;
        });

        const categoryBreakdown = Array.from(categoryMap.values()).map(cat => ({
            ...cat,
            averagePrice: cat.productCount > 0 ? cat.totalPrice / cat.productCount : 0,
        }));

        // Recent products
        const recentProducts = [...processedProducts]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5);

        return {
            topProducts,
            productPerformance,
            categoryBreakdown,
            recentProducts,
        };
    }

    // Get revenue analytics
    async getRevenueAnalytics(creatorId: string, filters?: CreatorAnalyticsFilters): Promise<CreatorRevenueAnalytics> {
        const dateFilter = this.buildDateFilter(filters);

        // Get all sales for the creator
        const { data: salesData } = await this.supabase
            .from('sales_transactions')
            .select(`
        *,
        products!inner(creator_id, name)
      `)
            .eq('products.creator_id', creatorId)
            .eq('payment_status', 'completed')
            .gte('created_at', dateFilter.start)
            .lte('created_at', dateFilter.end)
            .order('created_at', { ascending: false });

        const totalRevenue = salesData?.reduce((sum, sale) => sum + sale.amount, 0) || 0;

        // Calculate monthly revenue
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = salesData?.filter(sale => {
            const saleDate = new Date(sale.created_at);
            return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
        }).reduce((sum, sale) => sum + sale.amount, 0) || 0;

        // Revenue growth by month
        const revenueGrowth = this.calculateMonthlyGrowth(salesData || []);

        // Revenue by product
        const productRevenueMap = new Map();
        salesData?.forEach(sale => {
            const productId = sale.product_id;
            const productName = sale.products?.name || 'Unknown';
            if (!productRevenueMap.has(productId)) {
                productRevenueMap.set(productId, {
                    productId,
                    productName,
                    revenue: 0,
                    sales: 0,
                });
            }
            const productData = productRevenueMap.get(productId);
            productData.revenue += sale.amount;
            productData.sales += 1;
        });

        const revenueByProduct = Array.from(productRevenueMap.values()).map(product => ({
            ...product,
            percentage: totalRevenue > 0 ? (product.revenue / totalRevenue) * 100 : 0,
        }));

        // Monthly revenue breakdown
        const revenueByMonth = this.calculateMonthlyRevenue(salesData || []);

        // Get payout history (mock data for now)
        const payoutHistory = [
            {
                id: 'payout-1',
                amount: totalRevenue * 0.8, // Assuming 80% payout rate
                date: new Date(),
                status: 'completed' as const,
                method: 'Bank Transfer',
            },
        ];

        return {
            totalRevenue,
            monthlyRevenue,
            revenueGrowth,
            revenueByProduct,
            revenueByMonth,
            payoutHistory,
            pendingPayouts: totalRevenue * 0.2, // 20% pending
            nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        };
    }

    // Get audience analytics
    async getAudienceAnalytics(creatorId: string, filters?: CreatorAnalyticsFilters): Promise<CreatorAudienceAnalytics> {
        // Get follower count
        const { count: totalFollowers } = await this.supabase
            .from('user_follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', creatorId);

        // Mock data for now - in a real implementation, this would come from actual user data
        return {
            totalFollowers: totalFollowers || 0,
            followerGrowth: [],
            audienceDemographics: {
                countries: [],
                ageGroups: [],
                interests: [],
            },
            engagementMetrics: {
                averageEngagementRate: 0,
                totalLikes: 0,
                totalComments: 0,
                totalShares: 0,
                engagementTrend: [],
            },
            topReferrers: [],
        };
    }

    // Get performance metrics
    async getPerformanceMetrics(creatorId: string, filters?: CreatorAnalyticsFilters): Promise<CreatorPerformanceMetrics> {
        const dateFilter = this.buildDateFilter(filters);

        // Get page views for creator profile and products
        const { data: pageViews } = await this.supabase
            .from('page_views')
            .select('*')
            .like('page_path', `/creator/${creatorId}%`)
            .gte('created_at', dateFilter.start)
            .lte('created_at', dateFilter.end);

        const productViews = pageViews?.filter(view =>
            view.page_path.includes('/product/')
        ).length || 0;

        const profileViews = pageViews?.filter(view =>
            view.page_path === `/creator/${creatorId}` || view.page_path === `/creator/${creatorId}/`
        ).length || 0;

        return {
            productViews,
            profileViews,
            searchAppearances: 0, // TODO: Implement search tracking
            clickThroughRate: 0,
            bounceRate: 0,
            averageSessionDuration: 0,
            topPerformingContent: [],
        };
    }

    // Get creator goals
    async getCreatorGoals(creatorId: string): Promise<CreatorGoal[]> {
        const { data: goals } = await this.supabase
            .from('creator_goals')
            .select('*')
            .eq('creator_id', creatorId)
            .order('created_at', { ascending: false });

        return goals?.map(goal => ({
            id: goal.id,
            name: goal.name,
            type: goal.type,
            target: goal.target,
            current: goal.current,
            deadline: new Date(goal.deadline),
            status: goal.status,
        })) || [];
    }

    // Get creator insights
    async getCreatorInsights(creatorId: string): Promise<CreatorInsight[]> {
        // This would typically be generated by AI/ML algorithms
        // For now, return mock insights
        return [
            {
                id: 'insight-1',
                type: 'opportunity',
                title: 'Pricing Optimization',
                description: 'Your products are priced 15% below market average. Consider increasing prices.',
                actionable: true,
                priority: 'high',
                createdAt: new Date(),
            },
            {
                id: 'insight-2',
                type: 'tip',
                title: 'Content Strategy',
                description: 'Products with detailed descriptions convert 23% better.',
                actionable: true,
                priority: 'medium',
                createdAt: new Date(),
            },
        ];
    }

    // Get creator recommendations
    async getCreatorRecommendations(creatorId: string): Promise<CreatorRecommendation[]> {
        // This would typically be generated by AI/ML algorithms
        return [
            {
                id: 'rec-1',
                type: 'pricing',
                title: 'Increase Product Prices',
                description: 'Based on market analysis, you can increase prices by 10-15% without affecting demand.',
                expectedImpact: 'high',
                effort: 'low',
                priority: 1,
            },
            {
                id: 'rec-2',
                type: 'marketing',
                title: 'Improve Product Images',
                description: 'High-quality images can increase conversion rates by up to 30%.',
                expectedImpact: 'medium',
                effort: 'medium',
                priority: 2,
            },
        ];
    }

    // Helper methods
    private buildDateFilter(filters?: CreatorAnalyticsFilters) {
        const defaultEnd = new Date();
        const defaultStart = new Date();
        defaultStart.setDate(defaultStart.getDate() - 30);

        return {
            start: filters?.dateRange?.start?.toISOString() || defaultStart.toISOString(),
            end: filters?.dateRange?.end?.toISOString() || defaultEnd.toISOString(),
        };
    }

    private calculateMonthlyGrowth(salesData: any[]) {
        // Group sales by month and calculate growth
        const monthlyData = new Map();

        salesData.forEach(sale => {
            const date = new Date(sale.created_at);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

            if (!monthlyData.has(monthKey)) {
                monthlyData.set(monthKey, {
                    period: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
                    revenue: 0,
                    sales: 0,
                });
            }

            const monthData = monthlyData.get(monthKey);
            monthData.revenue += sale.amount;
            monthData.sales += 1;
        });

        const sortedMonths = Array.from(monthlyData.values()).sort((a, b) =>
            new Date(a.period).getTime() - new Date(b.period).getTime()
        );

        return sortedMonths.map((month, index) => ({
            ...month,
            growth: index > 0 ?
                ((month.revenue - sortedMonths[index - 1].revenue) / sortedMonths[index - 1].revenue) * 100 : 0,
        }));
    }

    private calculateMonthlyRevenue(salesData: any[]) {
        return this.calculateMonthlyGrowth(salesData);
    }
}

export const creatorAnalyticsService = new CreatorAnalyticsService();