import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const CategoryFiltersSchema = z.object({
    includeStats: z.coerce.boolean().default(false),
    parentId: z.string().optional(),
    active: z.coerce.boolean().default(true),
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const params = Object.fromEntries(searchParams.entries());

        const filters = CategoryFiltersSchema.parse(params);

        const supabase = createClient();

        // Build query for categories
        let query = supabase
            .from('product_categories')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('name', { ascending: true });

        if (filters.active) {
            query = query.eq('is_active', true);
        }

        if (filters.parentId) {
            query = query.eq('parent_id', filters.parentId);
        } else {
            // Get top-level categories by default
            query = query.is('parent_id', null);
        }

        const { data: categories, error } = await query;

        if (error) throw error;

        // If stats are requested, get product counts for each category
        if (filters.includeStats && categories) {
            const categoriesWithStats = await Promise.all(
                categories.map(async (category) => {
                    // Get product count for this category
                    const { count: productCount } = await supabase
                        .from('products')
                        .select('*', { count: 'exact', head: true })
                        .eq('category_id', category.id)
                        .eq('status', 'published');

                    // Get active listings count
                    const { count: listingCount } = await supabase
                        .from('marketplace_listings')
                        .select('products!inner(*)', { count: 'exact', head: true })
                        .eq('products.category_id', category.id)
                        .eq('status', 'active');

                    // Get subcategories count
                    const { count: subcategoryCount } = await supabase
                        .from('product_categories')
                        .select('*', { count: 'exact', head: true })
                        .eq('parent_id', category.id)
                        .eq('is_active', true);

                    return {
                        ...category,
                        stats: {
                            productCount: productCount || 0,
                            listingCount: listingCount || 0,
                            subcategoryCount: subcategoryCount || 0,
                        }
                    };
                })
            );

            return NextResponse.json({
                success: true,
                data: categoriesWithStats,
            });
        }

        return NextResponse.json({
            success: true,
            data: categories || [],
        });
    } catch (error) {
        console.error('Categories API error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid query parameters',
                    details: error.errors
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET subcategories for a specific category
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { categoryId } = body;

        if (!categoryId) {
            return NextResponse.json(
                { success: false, error: 'Category ID is required' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Get subcategories
        const { data: subcategories, error } = await supabase
            .from('product_categories')
            .select('*')
            .eq('parent_id', categoryId)
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
            .order('name', { ascending: true });

        if (error) throw error;

        // Get product counts for each subcategory
        const subcategoriesWithCounts = await Promise.all(
            (subcategories || []).map(async (subcategory) => {
                const { count } = await supabase
                    .from('marketplace_listings')
                    .select('products!inner(*)', { count: 'exact', head: true })
                    .eq('products.category_id', subcategory.id)
                    .eq('status', 'active');

                return {
                    ...subcategory,
                    productCount: count || 0,
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: subcategoriesWithCounts,
        });
    } catch (error) {
        console.error('Subcategories API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}