/**
 * Category Service
 * Database operations and business logic for product categories
 */

import { createClient } from '@/lib/supabase/server';
import { ProductCategory, CategoryType } from './types';
import { getAllCategories, getCategoryById } from './definitions';

export interface CategoryStats {
    id: string;
    name: string;
    productCount: number;
    averagePrice: number;
    popularityScore: number;
    trendingScore: number;
    recentGrowth: number;
}

export interface CategoryUsage {
    categoryId: string;
    userId: string;
    productId: string;
    createdAt: string;
    templateId?: string;
}

export class CategoryService {
    /**
     * Get all active categories with statistics
     */
    static async getCategories(): Promise<CategoryStats[]> {
        const supabase = createClient();
        const categories = getAllCategories();

        // Get product counts and statistics for each category
        const categoryStats = await Promise.all(
            categories.map(async (category) => {
                const { data: products, error } = await supabase
                    .from('products')
                    .select('id, pricing')
                    .eq('category', category.id)
                    .eq('status', 'published');

                if (error) {
                    console.error('Error fetching category stats:', error);
                    return {
                        id: category.id,
                        name: category.name,
                        productCount: 0,
                        averagePrice: 0,
                        popularityScore: category.metadata.popularityScore,
                        trendingScore: category.metadata.trendingScore,
                        recentGrowth: 0
                    };
                }

                const productCount = products?.length || 0;
                const averagePrice = products?.length
                    ? products.reduce((sum, p) => sum + (p.pricing?.amount || 0), 0) / products.length
                    : 0;

                // Calculate recent growth (simplified - would use time-based queries in production)
                const recentGrowth = Math.random() * 0.2 - 0.1; // Placeholder

                return {
                    id: category.id,
                    name: category.name,
                    productCount,
                    averagePrice,
                    popularityScore: category.metadata.popularityScore,
                    trendingScore: category.metadata.trendingScore,
                    recentGrowth
                };
            })
        );

        return categoryStats;
    }

    /**
     * Get category by ID with full details
     */
    static async getCategoryDetails(categoryId: string): Promise<ProductCategory | null> {
        const category = getCategoryById(categoryId);
        if (!category) return null;

        // Enhance with real-time data if needed
        return category;
    }

    /**
     * Get trending categories
     */
    static async getTrendingCategories(limit: number = 5): Promise<CategoryStats[]> {
        const categories = await this.getCategories();

        return categories
            .sort((a, b) => b.trendingScore - a.trendingScore)
            .slice(0, limit);
    }

    /**
     * Get popular categories
     */
    static async getPopularCategories(limit: number = 5): Promise<CategoryStats[]> {
        const categories = await this.getCategories();

        return categories
            .sort((a, b) => b.popularityScore - a.popularityScore)
            .slice(0, limit);
    }

    /**
     * Get categories by user preference
     */
    static async getCategoriesByUserPreference(userId: string): Promise<CategoryStats[]> {
        const supabase = createClient();

        // Get user's category usage history
        const { data: userProducts, error } = await supabase
            .from('products')
            .select('category')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching user categories:', error);
            return this.getPopularCategories();
        }

        // Count category usage
        const categoryUsage: Record<string, number> = {};
        userProducts?.forEach(product => {
            categoryUsage[product.category] = (categoryUsage[product.category] || 0) + 1;
        });

        const allCategories = await this.getCategories();

        // Sort by user preference (usage count) and popularity
        return allCategories.sort((a, b) => {
            const aUsage = categoryUsage[a.id] || 0;
            const bUsage = categoryUsage[b.id] || 0;

            if (aUsage !== bUsage) {
                return bUsage - aUsage; // Sort by usage first
            }

            return b.popularityScore - a.popularityScore; // Then by popularity
        });
    }

    /**
     * Search categories
     */
    static async searchCategories(query: string): Promise<CategoryStats[]> {
        const categories = await this.getCategories();
        const lowercaseQuery = query.toLowerCase();

        return categories.filter(category =>
            category.name.toLowerCase().includes(lowercaseQuery) ||
            getCategoryById(category.id)?.description.toLowerCase().includes(lowercaseQuery) ||
            getCategoryById(category.id)?.metadata.tags.some(tag =>
                tag.toLowerCase().includes(lowercaseQuery)
            )
        );
    }

    /**
     * Get category recommendations based on user activity
     */
    static async getCategoryRecommendations(userId: string, limit: number = 3): Promise<CategoryStats[]> {
        const supabase = createClient();

        // Get user's recent activity
        const { data: userActivity, error } = await supabase
            .from('products')
            .select('category, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error || !userActivity?.length) {
            return this.getTrendingCategories(limit);
        }

        // Analyze user's category patterns
        const recentCategories = userActivity.map(p => p.category);
        const allCategories = await this.getCategories();

        // Find related categories (simplified recommendation logic)
        const recommendations = allCategories
            .filter(category => !recentCategories.includes(category.id))
            .sort((a, b) => {
                // Prioritize trending categories that user hasn't used
                return (b.trendingScore + b.popularityScore) - (a.trendingScore + a.popularityScore);
            })
            .slice(0, limit);

        return recommendations;
    }

    /**
     * Track category usage
     */
    static async trackCategoryUsage(
        categoryId: string,
        userId: string,
        productId: string,
        templateId?: string
    ): Promise<void> {
        const supabase = createClient();

        const { error } = await supabase
            .from('category_usage')
            .insert({
                category_id: categoryId,
                user_id: userId,
                product_id: productId,
                template_id: templateId,
                created_at: new Date().toISOString()
            });

        if (error) {
            console.error('Error tracking category usage:', error);
        }
    }

    /**
     * Get category performance metrics
     */
    static async getCategoryMetrics(categoryId: string, days: number = 30): Promise<Record<string, any>> {
        const supabase = createClient();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get products created in this category
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, created_at, pricing')
            .eq('category', categoryId)
            .gte('created_at', startDate.toISOString());

        // Get category usage
        const { data: usage, error: usageError } = await supabase
            .from('category_usage')
            .select('*')
            .eq('category_id', categoryId)
            .gte('created_at', startDate.toISOString());

        if (productsError || usageError) {
            console.error('Error fetching category metrics:', productsError || usageError);
            return {};
        }

        const totalProducts = products?.length || 0;
        const totalUsage = usage?.length || 0;
        const averagePrice = products?.length
            ? products.reduce((sum, p) => sum + (p.pricing?.amount || 0), 0) / products.length
            : 0;

        // Calculate daily breakdown
        const dailyBreakdown: Record<string, number> = {};
        products?.forEach(product => {
            const date = new Date(product.created_at).toISOString().split('T')[0];
            dailyBreakdown[date] = (dailyBreakdown[date] || 0) + 1;
        });

        return {
            totalProducts,
            totalUsage,
            averagePrice,
            dailyBreakdown,
            growthRate: this.calculateGrowthRate(products || []),
            conversionRate: totalProducts > 0 ? totalProducts / totalUsage : 0
        };
    }

    /**
     * Calculate growth rate for products
     */
    private static calculateGrowthRate(products: any[]): number {
        if (products.length < 2) return 0;

        const now = new Date();
        const halfwayPoint = new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000)); // 15 days ago

        const recentProducts = products.filter(p => new Date(p.created_at) > halfwayPoint);
        const olderProducts = products.filter(p => new Date(p.created_at) <= halfwayPoint);

        if (olderProducts.length === 0) return 1; // 100% growth if no older products

        return (recentProducts.length - olderProducts.length) / olderProducts.length;
    }

    /**
     * Get category templates usage statistics
     */
    static async getTemplateUsageStats(categoryId: string): Promise<Record<string, number>> {
        const supabase = createClient();

        const { data: usage, error } = await supabase
            .from('category_usage')
            .select('template_id')
            .eq('category_id', categoryId)
            .not('template_id', 'is', null);

        if (error) {
            console.error('Error fetching template usage:', error);
            return {};
        }

        const templateStats: Record<string, number> = {};
        usage?.forEach(u => {
            if (u.template_id) {
                templateStats[u.template_id] = (templateStats[u.template_id] || 0) + 1;
            }
        });

        return templateStats;
    }

    /**
     * Update category popularity scores based on usage
     */
    static async updatePopularityScores(): Promise<void> {
        // This would be run periodically to update category popularity
        // based on actual usage data, user engagement, etc.

        const categories = await this.getCategories();

        for (const category of categories) {
            const metrics = await this.getCategoryMetrics(category.id, 30);

            // Calculate new popularity score based on metrics
            const newScore = this.calculatePopularityScore(metrics);

            // In a real implementation, you would update the category definition
            // or store dynamic scores in the database
            console.log(`Category ${category.name} popularity score: ${newScore}`);
        }
    }

    /**
     * Calculate popularity score based on metrics
     */
    private static calculatePopularityScore(metrics: Record<string, any>): number {
        const {
            totalProducts = 0,
            totalUsage = 0,
            growthRate = 0,
            conversionRate = 0
        } = metrics;

        // Weighted calculation of popularity
        const productWeight = 0.3;
        const usageWeight = 0.3;
        const growthWeight = 0.2;
        const conversionWeight = 0.2;

        const normalizedProducts = Math.min(totalProducts / 100, 1); // Normalize to 0-1
        const normalizedUsage = Math.min(totalUsage / 500, 1);
        const normalizedGrowth = Math.max(0, Math.min(growthRate + 0.5, 1)); // -0.5 to 0.5 -> 0 to 1
        const normalizedConversion = Math.min(conversionRate, 1);

        return (
            normalizedProducts * productWeight +
            normalizedUsage * usageWeight +
            normalizedGrowth * growthWeight +
            normalizedConversion * conversionWeight
        );
    }
}

export const categoryService = CategoryService;