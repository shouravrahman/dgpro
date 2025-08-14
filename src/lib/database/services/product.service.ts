// Product Service
// Handles all product-related database operations

import type { Database } from '@/types/database';
import type { DatabaseClient } from '../index';

export class ProductService {
    constructor(private client: DatabaseClient) { }

    async getProduct(id: string) {
        const { data, error } = await this.client
            .from('products')
            .select(`
        *,
        users!products_user_id_fkey (
          id,
          full_name,
          avatar_url
        ),
        product_categories (
          id,
          name,
          slug
        ),
        marketplace_listings (
          id,
          price,
          status,
          is_featured,
          sales_count
        )
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async getProducts(filters: {
        userId?: string;
        categoryId?: string;
        status?: Database['public']['Enums']['product_status'];
        featured?: boolean;
        limit?: number;
        offset?: number;
        search?: string;
    } = {}) {
        let query = this.client
            .from('products')
            .select(`
        *,
        users!products_user_id_fkey (
          id,
          full_name,
          avatar_url
        ),
        product_categories (
          id,
          name,
          slug
        ),
        marketplace_listings (
          id,
          price,
          status,
          is_featured,
          sales_count
        )
      `);

        if (filters.userId) {
            query = query.eq('user_id', filters.userId);
        }

        if (filters.categoryId) {
            query = query.eq('category_id', filters.categoryId);
        }

        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.featured) {
            query = query.eq('is_featured', true);
        }

        if (filters.search) {
            query = query.textSearch('name', filters.search);
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

    async getProductStats(productId: string) {
        const { data, error } = await this.client
            .from('product_stats')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) throw error;
        return data;
    }

    async createProduct(product: Database['public']['Tables']['products']['Insert']) {
        const { data, error } = await this.client
            .from('products')
            .insert(product)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateProduct(id: string, updates: Database['public']['Tables']['products']['Update']) {
        const { data, error } = await this.client
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteProduct(id: string) {
        const { error } = await this.client
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async incrementViewCount(id: string) {
        // Use RPC function for atomic increment
        const { data, error } = await this.client
            .rpc('increment_product_views', { product_id: id });

        if (error) throw error;
        return data;
    }

    async incrementDownloadCount(id: string) {
        // Use RPC function for atomic increment
        const { data, error } = await this.client
            .rpc('increment_product_downloads', { product_id: id });

        if (error) throw error;
        return data;
    }

    async likeProduct(productId: string, userId: string) {
        const { data, error } = await this.client
            .from('product_likes')
            .insert({
                product_id: productId,
                user_id: userId
            })
            .select()
            .single();

        if (error) throw error;

        // Update like count using RPC
        await this.client.rpc('increment_product_likes', { product_id: productId });

        return data;
    }

    async unlikeProduct(productId: string, userId: string) {
        const { error } = await this.client
            .from('product_likes')
            .delete()
            .eq('product_id', productId)
            .eq('user_id', userId);

        if (error) throw error;

        // Update like count using RPC
        await this.client.rpc('decrement_product_likes', { product_id: productId });
    }

    async isProductLiked(productId: string, userId: string): Promise<boolean> {
        const { data, error } = await this.client
            .from('product_likes')
            .select('id')
            .eq('product_id', productId)
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
    }

    async getUserLikedProducts(userId: string, limit = 20, offset = 0) {
        const { data, error } = await this.client
            .from('product_likes')
            .select(`
        *,
        products (
          *,
          users!products_user_id_fkey (
            id,
            full_name,
            avatar_url
          ),
          product_categories (
            id,
            name,
            slug
          )
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return data;
    }
}