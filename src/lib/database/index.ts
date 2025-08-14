// Database Service Layer
// Centralized database operations with optimized queries and caching

import { createClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';
import { unstable_cache } from 'next/cache';

// Import services
import { UserService } from './services/user.service';
import { ProductService } from './services/product.service';
import { CategoryService } from './services/category.service';
import { MarketplaceService } from './services/marketplace.service';
import { CartService } from './services/cart.service';

// Type-safe database client
export type DatabaseClient = Awaited<ReturnType<typeof createClient>>;
export type BrowserDatabaseClient = ReturnType<typeof createBrowserClient>;

// Database service class for server-side operations
export class DatabaseService {
    private client: DatabaseClient;
    private _users?: UserService;
    private _products?: ProductService;
    private _categories?: CategoryService;
    private _marketplace?: MarketplaceService;
    private _cart?: CartService;

    constructor(client: DatabaseClient) {
        this.client = client;
    }

    // Static factory method to create service with client
    static async create(client?: DatabaseClient): Promise<DatabaseService> {
        const dbClient = client || await createClient();
        return new DatabaseService(dbClient);
    }

    // Service getters with lazy initialization
    get users(): UserService {
        if (!this._users) {
            this._users = new UserService(this.client);
        }
        return this._users;
    }

    get products(): ProductService {
        if (!this._products) {
            this._products = new ProductService(this.client);
        }
        return this._products;
    }

    get categories(): CategoryService {
        if (!this._categories) {
            this._categories = new CategoryService(this.client);
        }
        return this._categories;
    }

    get marketplace(): MarketplaceService {
        if (!this._marketplace) {
            this._marketplace = new MarketplaceService(this.client);
        }
        return this._marketplace;
    }

    get cart(): CartService {
        if (!this._cart) {
            this._cart = new CartService(this.client);
        }
        return this._cart;
    }

    // Direct client access for custom queries
    get client(): DatabaseClient {
        return this.client;
    }

    // Market trends operations (keeping in main service for now)
    async getMarketTrends(category?: string, limit = 10) {
        let query = this.client
            .from('market_trends')
            .select('*')
            .order('analysis_date', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    async getLatestTrendForCategory(category: string) {
        const { data, error } = await this.client
            .from('market_trends')
            .select('*')
            .eq('category', category)
            .order('analysis_date', { ascending: false })
            .limit(1)
            .single();

        if (error) throw error;
        return data;
    }

    // Sales and transaction operations
    async getSalesTransactions(filters: {
        buyerId?: string;
        sellerId?: string;
        affiliateId?: string;
        status?: Database['public']['Enums']['payment_status'];
        limit?: number;
        offset?: number;
    } = {}) {
        let query = this.client
            .from('sales_transactions')
            .select(`
        *,
        buyer:users!sales_transactions_buyer_id_fkey (
          id,
          full_name,
          email
        ),
        seller:users!sales_transactions_seller_id_fkey (
          id,
          full_name,
          email
        ),
        products (
          id,
          name,
          slug
        ),
        product_bundles (
          id,
          name,
          slug
        ),
        affiliates (
          id,
          affiliate_code,
          users (
            id,
            full_name
          )
        )
      `);

        if (filters.buyerId) {
            query = query.eq('buyer_id', filters.buyerId);
        }

        if (filters.sellerId) {
            query = query.eq('seller_id', filters.sellerId);
        }

        if (filters.affiliateId) {
            query = query.eq('affiliate_id', filters.affiliateId);
        }

        if (filters.status) {
            query = query.eq('payment_status', filters.status);
        }

        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        if (filters.offset) {
            query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    // Review operations
    async getProductReviews(productId: string, limit = 10, offset = 0) {
        const { data, error } = await this.client
            .from('product_reviews')
            .select(`
        *,
        users (
          id,
          full_name,
          avatar_url
        )
      `)
            .eq('product_id', productId)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return data;
    }

    async createReview(review: Database['public']['Tables']['product_reviews']['Insert']) {
        const { data, error } = await this.client
            .from('product_reviews')
            .insert(review)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Notification operations
    async getUserNotifications(userId: string, limit = 20, unreadOnly = false) {
        let query = this.client
            .from('notifications')
            .select('*')
            .eq('user_id', userId);

        if (unreadOnly) {
            query = query.eq('is_read', false);
        }

        query = query
            .order('created_at', { ascending: false })
            .limit(limit);

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    async markNotificationAsRead(id: string) {
        const { error } = await this.client
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    async createNotification(notification: Database['public']['Tables']['notifications']['Insert']) {
        const { data, error } = await this.client
            .from('notifications')
            .insert(notification)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Admin operations
    async getAuditLogs(filters: {
        adminId?: string;
        action?: string;
        targetType?: string;
        limit?: number;
        offset?: number;
    } = {}) {
        let query = this.client
            .from('audit_logs')
            .select(`
        *,
        admin_users (
          id,
          users (
            id,
            full_name,
            email
          )
        )
      `);

        if (filters.adminId) {
            query = query.eq('admin_id', filters.adminId);
        }

        if (filters.action) {
            query = query.eq('action', filters.action);
        }

        if (filters.targetType) {
            query = query.eq('target_type', filters.targetType);
        }

        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        if (filters.offset) {
            query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    async createAuditLog(log: Database['public']['Tables']['audit_logs']['Insert']) {
        const { data, error } = await this.client
            .from('audit_logs')
            .insert(log)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // System settings
    async getSystemSetting(key: string) {
        const { data, error } = await this.client
            .from('system_settings')
            .select('*')
            .eq('key', key)
            .single();

        if (error) throw error;
        return data;
    }

    async getSystemSettings(category?: string, publicOnly = false) {
        let query = this.client
            .from('system_settings')
            .select('*');

        if (category) {
            query = query.eq('category', category);
        }

        if (publicOnly) {
            query = query.eq('is_public', true);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    async updateSystemSetting(key: string, value: unknown, updatedBy?: string) {
        const { data, error } = await this.client
            .from('system_settings')
            .update({
                value,
                updated_by: updatedBy,
                updated_at: new Date().toISOString()
            })
            .eq('key', key)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

// Cached database operations for better performance
export const getCachedCategories = unstable_cache(
    async () => {
        const db = await DatabaseService.create();
        return db.categories.getCategories();
    },
    ['categories'],
    {
        revalidate: 3600, // 1 hour
        tags: ['categories']
    }
);

export const getCachedMarketTrends = unstable_cache(
    async (category?: string) => {
        const db = await DatabaseService.create();
        return db.getMarketTrends(category, 5);
    },
    ['market-trends'],
    {
        revalidate: 1800, // 30 minutes
        tags: ['trends']
    }
);

export const getCachedFeaturedProducts = unstable_cache(
    async (limit = 10) => {
        const db = await DatabaseService.create();
        return db.products.getProducts({ featured: true, status: 'published', limit });
    },
    ['featured-products'],
    {
        revalidate: 900, // 15 minutes
        tags: ['products', 'featured']
    }
);

// Export factory function for creating database service
export async function createDatabaseService(client?: DatabaseClient): Promise<DatabaseService> {
    return DatabaseService.create(client);
}