// Marketplace Service
// Handles all marketplace and sales-related database operations

import type { Database } from '@/types/database';
import type { DatabaseClient } from '../index';

export class MarketplaceService {
    constructor(private client: DatabaseClient) { }

    async getMarketplaceListings(filters: {
        sellerId?: string;
        categoryId?: string;
        featured?: boolean;
        status?: Database['public']['Enums']['listing_status'];
        minPrice?: number;
        maxPrice?: number;
        limit?: number;
        offset?: number;
        search?: string;
    } = {}) {
        let query = this.client
            .from('marketplace_listings')
            .select(`
        *,
        products (
          *,
          product_categories (
            id,
            name,
            slug
          )
        ),
        users!marketplace_listings_seller_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `);

        if (filters.sellerId) {
            query = query.eq('seller_id', filters.sellerId);
        }

        if (filters.status) {
            query = query.eq('status', filters.status);
        } else {
            query = query.eq('status', 'active');
        }

        if (filters.featured) {
            query = query.eq('is_featured', true);
        }

        if (filters.minPrice) {
            query = query.gte('price', filters.minPrice);
        }

        if (filters.maxPrice) {
            query = query.lte('price', filters.maxPrice);
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

    async createListing(listing: Database['public']['Tables']['marketplace_listings']['Insert']) {
        const { data, error } = await this.client
            .from('marketplace_listings')
            .insert(listing)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateListing(id: string, updates: Database['public']['Tables']['marketplace_listings']['Update']) {
        const { data, error } = await this.client
            .from('marketplace_listings')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteListing(id: string) {
        const { error } = await this.client
            .from('marketplace_listings')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async incrementSalesCount(listingId: string) {
        // Use RPC function for atomic increment
        const { data, error } = await this.client
            .rpc('increment_listing_sales', { listing_id: listingId });

        if (error) throw error;
        return data;
    }

    async getFeaturedListings(limit = 10) {
        const { data, error } = await this.client
            .from('marketplace_listings')
            .select(`
        *,
        products (
          *,
          product_categories (
            id,
            name,
            slug
          )
        ),
        users!marketplace_listings_seller_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
            .eq('status', 'active')
            .eq('is_featured', true)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    async getTopSellingListings(limit = 10) {
        const { data, error } = await this.client
            .from('marketplace_listings')
            .select(`
        *,
        products (
          *,
          product_categories (
            id,
            name,
            slug
          )
        ),
        users!marketplace_listings_seller_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
            .eq('status', 'active')
            .order('sales_count', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    async getRecentListings(limit = 10) {
        const { data, error } = await this.client
            .from('marketplace_listings')
            .select(`
        *,
        products (
          *,
          product_categories (
            id,
            name,
            slug
          )
        ),
        users!marketplace_listings_seller_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    async searchListings(query: string, filters: {
        categoryId?: string;
        minPrice?: number;
        maxPrice?: number;
        limit?: number;
        offset?: number;
    } = {}) {
        let searchQuery = this.client
            .from('marketplace_listings')
            .select(`
        *,
        products (
          *,
          product_categories (
            id,
            name,
            slug
          )
        ),
        users!marketplace_listings_seller_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
            .eq('status', 'active');

        // Add text search on product name and description
        if (query) {
            searchQuery = searchQuery.textSearch('products.name', query);
        }

        if (filters.categoryId) {
            searchQuery = searchQuery.eq('products.category_id', filters.categoryId);
        }

        if (filters.minPrice) {
            searchQuery = searchQuery.gte('price', filters.minPrice);
        }

        if (filters.maxPrice) {
            searchQuery = searchQuery.lte('price', filters.maxPrice);
        }

        if (filters.limit) {
            searchQuery = searchQuery.limit(filters.limit);
        }

        if (filters.offset) {
            searchQuery = searchQuery.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
        }

        searchQuery = searchQuery.order('created_at', { ascending: false });

        const { data, error } = await searchQuery;

        if (error) throw error;
        return data;
    }

    async getMarketplaceStats() {
        const [
            { count: totalListings },
            { count: activeListings },
            { count: featuredListings },
            { data: topCategories }
        ] = await Promise.all([
            this.client
                .from('marketplace_listings')
                .select('*', { count: 'exact', head: true }),

            this.client
                .from('marketplace_listings')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active'),

            this.client
                .from('marketplace_listings')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active')
                .eq('is_featured', true),

            this.client
                .from('marketplace_listings')
                .select(`
          products!inner (
            category_id,
            product_categories (
              id,
              name,
              slug
            )
          )
        `)
                .eq('status', 'active')
                .limit(10)
        ]);

        return {
            totalListings: totalListings || 0,
            activeListings: activeListings || 0,
            featuredListings: featuredListings || 0,
            topCategories: topCategories || []
        };
    }
}