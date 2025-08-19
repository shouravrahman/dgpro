/**
 * Market Intelligence Database Service
 * Handles all database operations for market intelligence data
 */

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database/types';

type MarketPlatform = Database['public']['Tables']['market_platforms']['Row'];
type MarketCategory = Database['public']['Tables']['market_categories']['Row'];
type MarketData = Database['public']['Tables']['market_data']['Row'];
type AdIntelligence = Database['public']['Tables']['ad_intelligence']['Row'];
type MarketTrend = Database['public']['Tables']['market_trends']['Row'];
type UserMarketInsights = Database['public']['Tables']['user_market_insights']['Row'];
type ScrapingJob = Database['public']['Tables']['scraping_jobs']['Row'];
type AIMarketAnalysis = Database['public']['Tables']['ai_market_analysis']['Row'];

export class MarketIntelligenceService {
    private supabase = createClient();

    // Market Platforms
    async getMarketPlatforms(activeOnly: boolean = true) {
        const query = this.supabase
            .from('market_platforms')
            .select('*')
            .order('name');

        if (activeOnly) {
            query.eq('is_active', true);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async updatePlatformLastScraped(platformId: string) {
        const { error } = await this.supabase
            .from('market_platforms')
            .update({ last_scraped_at: new Date().toISOString() })
            .eq('id', platformId);

        if (error) throw error;
    }

    // Market Categories
    async getMarketCategories(parentId?: string) {
        const query = this.supabase
            .from('market_categories')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (parentId) {
            query.eq('parent_id', parentId);
        } else {
            query.is('parent_id', null);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async getCategoryBySlug(slug: string) {
        const { data, error } = await this.supabase
            .from('market_categories')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error) throw error;
        return data;
    }

    // Market Data
    async saveMarketData(marketData: Partial<MarketData>[]) {
        const { data, error } = await this.supabase
            .from('market_data')
            .upsert(marketData, {
                onConflict: 'platform_id,external_id',
                ignoreDuplicates: false
            })
            .select();

        if (error) throw error;
        return data;
    }

    async getMarketDataByCategory(categoryId: string, limit: number = 50) {
        const { data, error } = await this.supabase
            .from('market_data')
            .select(`
        *,
        market_platforms(name, type),
        market_categories(name, slug)
      `)
            .eq('category_id', categoryId)
            .eq('is_active', true)
            .order('trend_score', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    async getTrendingProducts(limit: number = 20) {
        const { data, error } = await this.supabase
            .from('market_data')
            .select(`
        *,
        market_platforms(name, type),
        market_categories(name, slug)
      `)
            .eq('is_active', true)
            .gte('trend_score', 7.0)
            .order('trend_score', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    async getHighOpportunityProducts(limit: number = 20) {
        const { data, error } = await this.supabase
            .from('market_data')
            .select(`
        *,
        market_platforms(name, type),
        market_categories(name, slug)
      `)
            .eq('is_active', true)
            .gte('opportunity_score', 8.0)
            .eq('competition_level', 'low')
            .order('opportunity_score', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    // Ad Intelligence
    async saveAdIntelligence(adData: Partial<AdIntelligence>[]) {
        const { data, error } = await this.supabase
            .from('ad_intelligence')
            .upsert(adData, {
                onConflict: 'platform,ad_id',
                ignoreDuplicates: false
            })
            .select();

        if (error) throw error;
        return data;
    }

    async getAdIntelligenceByCategory(category: string, limit: number = 30) {
        const { data, error } = await this.supabase
            .from('ad_intelligence')
            .select('*')
            .eq('product_category', category)
            .order('market_opportunity_score', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    async getTopAdvertisers(platform: string = 'meta', limit: number = 10) {
        const { data, error } = await this.supabase
            .from('ad_intelligence')
            .select('advertiser_name, market_opportunity_score')
            .eq('platform', platform)
            .order('market_opportunity_score', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    // Market Trends
    async saveMarketTrend(trendData: Partial<MarketTrend>) {
        const { data, error } = await this.supabase
            .from('market_trends')
            .insert(trendData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getMarketTrends(categoryId?: string, trendType?: string, limit: number = 20) {
        let query = this.supabase
            .from('market_trends')
            .select(`
        *,
        market_categories(name, slug)
      `)
            .order('confidence_score', { ascending: false })
            .limit(limit);

        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }

        if (trendType) {
            query = query.eq('trend_type', trendType);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async getRisingTrends(limit: number = 10) {
        return this.getMarketTrends(undefined, 'rising', limit);
    }

    // User Market Insights
    async getUserMarketInsights(userId: string) {
        const { data, error } = await this.supabase
            .from('user_market_insights')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
        return data;
    }

    async saveUserMarketInsights(userId: string, insights: Partial<UserMarketInsights>) {
        const { data, error } = await this.supabase
            .from('user_market_insights')
            .upsert({
                user_id: userId,
                ...insights,
                last_updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateUserInsights(userId: string, updates: Partial<UserMarketInsights>) {
        const { data, error } = await this.supabase
            .from('user_market_insights')
            .update({
                ...updates,
                last_updated_at: new Date().toISOString(),
                insights_version: this.supabase.rpc('increment_insights_version', { user_id: userId })
            })
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Scraping Jobs
    async createScrapingJob(jobData: Partial<ScrapingJob>) {
        const { data, error } = await this.supabase
            .from('scraping_jobs')
            .insert(jobData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getScrapingJobs(status?: string, platformId?: string) {
        let query = this.supabase
            .from('scraping_jobs')
            .select(`
        *,
        market_platforms(name, type)
      `)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        if (platformId) {
            query = query.eq('platform_id', platformId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async updateScrapingJobStatus(jobId: string, status: string, results?: any) {
        const updates: any = {
            status,
            updated_at: new Date().toISOString()
        };

        if (status === 'running') {
            updates.started_at = new Date().toISOString();
        } else if (status === 'completed' || status === 'failed') {
            updates.completed_at = new Date().toISOString();
            updates.last_run_at = new Date().toISOString();
        }

        if (results) {
            updates.items_scraped = results.itemsScraped || 0;
            updates.items_processed = results.itemsProcessed || 0;
            updates.errors_count = results.errorsCount || 0;
            updates.error_details = results.errorDetails || {};
        }

        const { data, error } = await this.supabase
            .from('scraping_jobs')
            .update(updates)
            .eq('id', jobId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // AI Market Analysis
    async saveAIAnalysis(analysisData: Partial<AIMarketAnalysis>) {
        const { data, error } = await this.supabase
            .from('ai_market_analysis')
            .insert(analysisData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getUserAIAnalysis(userId: string, targetType?: string, limit: number = 20) {
        let query = this.supabase
            .from('ai_market_analysis')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (targetType) {
            query = query.eq('target_type', targetType);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    // Analytics and Reporting
    async getMarketOverview() {
        const [platforms, categories, totalProducts, recentTrends] = await Promise.all([
            this.getMarketPlatforms(),
            this.getMarketCategories(),
            this.getTotalProductCount(),
            this.getRisingTrends(5)
        ]);

        return {
            platforms: platforms?.length || 0,
            categories: categories?.length || 0,
            totalProducts,
            recentTrends: recentTrends?.length || 0
        };
    }

    private async getTotalProductCount() {
        const { count, error } = await this.supabase
            .from('market_data')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        if (error) throw error;
        return count || 0;
    }

    async getCategoryPerformance(categoryId: string) {
        const { data, error } = await this.supabase
            .from('market_data')
            .select('price, sales_count, rating, trend_score, opportunity_score')
            .eq('category_id', categoryId)
            .eq('is_active', true);

        if (error) throw error;

        if (!data || data.length === 0) {
            return {
                averagePrice: 0,
                totalSales: 0,
                averageRating: 0,
                averageTrendScore: 0,
                averageOpportunityScore: 0,
                productCount: 0
            };
        }

        const stats = data.reduce((acc, item) => {
            acc.totalPrice += item.price || 0;
            acc.totalSales += item.sales_count || 0;
            acc.totalRating += item.rating || 0;
            acc.totalTrendScore += item.trend_score || 0;
            acc.totalOpportunityScore += item.opportunity_score || 0;
            return acc;
        }, {
            totalPrice: 0,
            totalSales: 0,
            totalRating: 0,
            totalTrendScore: 0,
            totalOpportunityScore: 0
        });

        const count = data.length;

        return {
            averagePrice: stats.totalPrice / count,
            totalSales: stats.totalSales,
            averageRating: stats.totalRating / count,
            averageTrendScore: stats.totalTrendScore / count,
            averageOpportunityScore: stats.totalOpportunityScore / count,
            productCount: count
        };
    }

    // Search and filtering
    async searchMarketData(query: string, filters?: {
        categoryId?: string;
        platformId?: string;
        minPrice?: number;
        maxPrice?: number;
        minTrendScore?: number;
        competitionLevel?: string;
    }, limit: number = 50) {
        let dbQuery = this.supabase
            .from('market_data')
            .select(`
        *,
        market_platforms(name, type),
        market_categories(name, slug)
      `)
            .eq('is_active', true)
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .order('trend_score', { ascending: false })
            .limit(limit);

        if (filters?.categoryId) {
            dbQuery = dbQuery.eq('category_id', filters.categoryId);
        }

        if (filters?.platformId) {
            dbQuery = dbQuery.eq('platform_id', filters.platformId);
        }

        if (filters?.minPrice) {
            dbQuery = dbQuery.gte('price', filters.minPrice);
        }

        if (filters?.maxPrice) {
            dbQuery = dbQuery.lte('price', filters.maxPrice);
        }

        if (filters?.minTrendScore) {
            dbQuery = dbQuery.gte('trend_score', filters.minTrendScore);
        }

        if (filters?.competitionLevel) {
            dbQuery = dbQuery.eq('competition_level', filters.competitionLevel);
        }

        const { data, error } = await dbQuery;
        if (error) throw error;
        return data;
    }
}