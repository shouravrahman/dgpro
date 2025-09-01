import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const TagFiltersSchema = z.object({
    limit: z.coerce.number().min(1).max(100).default(50),
    search: z.string().optional(),
    category: z.string().optional(),
    minCount: z.coerce.number().min(1).default(1),
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const params = Object.fromEntries(searchParams.entries());

        const filters = TagFiltersSchema.parse(params);

        const supabase = createClient();

        // Build query to get all tags from published products
        let query = supabase
            .from('products')
            .select('tags, category_id, product_categories(name, slug)')
            .eq('status', 'published')
            .not('tags', 'is', null);

        // Filter by category if specified
        if (filters.category) {
            query = query.eq('product_categories.slug', filters.category);
        }

        const { data: products, error } = await query;

        if (error) throw error;

        // Process tags and count occurrences
        const tagCounts: Record<string, { count: number; categories: Set<string> }> = {};

        (products || []).forEach(product => {
            if (product.tags && Array.isArray(product.tags)) {
                product.tags.forEach((tag: string) => {
                    const normalizedTag = tag.trim().toLowerCase();

                    // Filter by search if specified
                    if (filters.search && !normalizedTag.includes(filters.search.toLowerCase())) {
                        return;
                    }

                    if (!tagCounts[normalizedTag]) {
                        tagCounts[normalizedTag] = { count: 0, categories: new Set() };
                    }

                    tagCounts[normalizedTag].count++;

                    if (product.product_categories?.name) {
                        tagCounts[normalizedTag].categories.add(product.product_categories.name);
                    }
                });
            }
        });

        // Convert to array and filter by minimum count
        const tagsArray = Object.entries(tagCounts)
            .filter(([, data]) => data.count >= filters.minCount)
            .map(([tag, data]) => ({
                tag,
                count: data.count,
                categories: Array.from(data.categories),
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, filters.limit);

        // Get trending tags (tags that have been used recently)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: recentProducts } = await supabase
            .from('products')
            .select('tags')
            .eq('status', 'published')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .not('tags', 'is', null);

        const trendingTagCounts: Record<string, number> = {};
        (recentProducts || []).forEach(product => {
            if (product.tags && Array.isArray(product.tags)) {
                product.tags.forEach((tag: string) => {
                    const normalizedTag = tag.trim().toLowerCase();
                    trendingTagCounts[normalizedTag] = (trendingTagCounts[normalizedTag] || 0) + 1;
                });
            }
        });

        const trendingTags = Object.entries(trendingTagCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));

        return NextResponse.json({
            success: true,
            data: {
                tags: tagsArray,
                trending: trendingTags,
                total: tagsArray.length,
                filters: {
                    applied: {
                        search: filters.search,
                        category: filters.category,
                        minCount: filters.minCount,
                    }
                }
            },
        });
    } catch (error) {
        console.error('Tags API error:', error);

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

// POST endpoint to get tag suggestions based on input
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { input, limit = 10 } = body;

        if (!input || typeof input !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Input is required' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Get all tags that match the input
        const { data: products, error } = await supabase
            .from('products')
            .select('tags')
            .eq('status', 'published')
            .not('tags', 'is', null);

        if (error) throw error;

        const matchingTags = new Set<string>();
        const inputLower = input.toLowerCase();

        (products || []).forEach(product => {
            if (product.tags && Array.isArray(product.tags)) {
                product.tags.forEach((tag: string) => {
                    const tagLower = tag.toLowerCase();
                    if (tagLower.includes(inputLower) && tagLower !== inputLower) {
                        matchingTags.add(tag);
                    }
                });
            }
        });

        const suggestions = Array.from(matchingTags)
            .slice(0, limit)
            .sort();

        return NextResponse.json({
            success: true,
            data: {
                suggestions,
                input,
            },
        });
    } catch (error) {
        console.error('Tag suggestions API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}