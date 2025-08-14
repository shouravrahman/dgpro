// Category Service
// Handles all product category-related database operations

import type { Database } from '@/types/database';
import type { DatabaseClient } from '../index';

export class CategoryService {
    constructor(private client: DatabaseClient) { }

    async getCategories(parentId?: string) {
        let query = this.client
            .from('product_categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

        if (parentId) {
            query = query.eq('parent_id', parentId);
        } else {
            query = query.is('parent_id', null);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    async getCategoryWithChildren(id: string) {
        const { data, error } = await this.client
            .from('product_categories')
            .select(`
        *,
        children:product_categories!parent_id (*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async getCategoryHierarchy() {
        const { data, error } = await this.client
            .from('product_categories')
            .select(`
        *,
        children:product_categories!parent_id (
          *,
          children:product_categories!parent_id (*)
        )
      `)
            .is('parent_id', null)
            .eq('is_active', true)
            .order('sort_order');

        if (error) throw error;
        return data;
    }

    async getCategoryBySlug(slug: string) {
        const { data, error } = await this.client
            .from('product_categories')
            .select(`
        *,
        parent:product_categories!parent_id (*),
        children:product_categories!parent_id (*)
      `)
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error) throw error;
        return data;
    }

    async createCategory(category: Database['public']['Tables']['product_categories']['Insert']) {
        const { data, error } = await this.client
            .from('product_categories')
            .insert(category)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateCategory(id: string, updates: Database['public']['Tables']['product_categories']['Update']) {
        const { data, error } = await this.client
            .from('product_categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteCategory(id: string) {
        // Check if category has children
        const { data: children } = await this.client
            .from('product_categories')
            .select('id')
            .eq('parent_id', id);

        if (children && children.length > 0) {
            throw new Error('Cannot delete category with subcategories');
        }

        // Check if category has products
        const { data: products } = await this.client
            .from('products')
            .select('id')
            .eq('category_id', id);

        if (products && products.length > 0) {
            throw new Error('Cannot delete category with products');
        }

        const { error } = await this.client
            .from('product_categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async getCategoryProductCount(categoryId: string) {
        const { count, error } = await this.client
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', categoryId)
            .eq('status', 'published');

        if (error) throw error;
        return count || 0;
    }

    async getCategoriesWithProductCounts() {
        const categories = await this.getCategories();

        const categoriesWithCounts = await Promise.all(
            categories.map(async (category) => {
                const productCount = await this.getCategoryProductCount(category.id);
                return {
                    ...category,
                    product_count: productCount
                };
            })
        );

        return categoriesWithCounts;
    }

    async reorderCategories(categoryIds: string[]) {
        const updates = categoryIds.map((id, index) => ({
            id,
            sort_order: index + 1
        }));

        const { data, error } = await this.client
            .from('product_categories')
            .upsert(updates)
            .select();

        if (error) throw error;
        return data;
    }
}