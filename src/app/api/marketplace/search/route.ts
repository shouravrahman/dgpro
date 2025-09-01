import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MarketplaceService } from '@/lib/database/services/marketplace.service';
import { z } from 'zod';

const SearchSchema = z.object({
    q: z.string().min(1, 'Search query is required'),
    category: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    tags: z.string().optional(),
    sortBy: z.enum(['relevance', 'newest', 'price_low', 'price_high', 'popular']).default('relevance'),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(12),
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const params = Object.fromEntries(searchParams.entries());

        const searchParams_ = SearchSchema.parse(params);

        const supabase = createClient();
        const marketplaceService = new MarketplaceService(supabase);

        const offset = (searchParams_.page - 1) * searchParams_.limit;

        // Perform search
        const results = await marketplaceService.searchListings(searchParams_.q, {
            categoryId: searchParams_.category,
            minPrice: searchParams_.minPrice,
            maxPrice: searchParams_.maxPrice,
            limit: searchParams_.limit,
            offset,
        });

        // Apply tag filtering if specified
        let filteredResults = results;
        if (searchParams_.tags) {
            const tagArray = searchParams_.tags.split(',').map(tag => tag.trim().toLowerCase());
            filteredResults = results.filter(listing =>
                listing.products?.tags?.some(tag =>
                    tagArray.includes(tag.toLowerCase())
                )
            );
        }

        // Apply sorting (relevance is default from search)
        if (searchParams_.sortBy !== 'relevance') {
            filteredResults = sortSearchResults(filteredResults, searchParams_.sortBy);
        }

        // Get search suggestions based on query
        const suggestions = await getSearchSuggestions(supabase, searchParams_.q);

        return NextResponse.json({
            success: true,
            data: {
                results: filteredResults,
                query: searchParams_.q,
                suggestions,
                pagination: {
                    page: searchParams_.page,
                    limit: searchParams_.limit,
                    total: filteredResults.length,
                    hasMore: filteredResults.length === searchParams_.limit,
                },
                filters: {
                    appliedFilters: {
                        category: searchParams_.category,
                        minPrice: searchParams_.minPrice,
                        maxPrice: searchParams_.maxPrice,
                        tags: searchParams_.tags,
                        sortBy: searchParams_.sortBy,
                    }
                }
            },
        });
    } catch (error) {
        console.error('Search API error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid search parameters',
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

// Helper function to sort search results
function sortSearchResults(results: any[], sortBy: string) {
    switch (sortBy) {
        case 'newest':
            return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        case 'price_low':
            return results.sort((a, b) => a.price - b.price);
        case 'price_high':
            return results.sort((a, b) => b.price - a.price);
        case 'popular':
            return results.sort((a, b) => b.sales_count - a.sales_count);
        default:
            return results;
    }
}

// Helper function to get search suggestions
async function getSearchSuggestions(supabase: any, query: string) {
    try {
        // Get popular products that match partial query
        const { data: products } = await supabase
            .from('products')
            .select('name, tags')
            .eq('status', 'published')
            .ilike('name', `%${query}%`)
            .limit(5);

        // Get popular categories that match query
        const { data: categories } = await supabase
            .from('product_categories')
            .select('name, slug')
            .eq('is_active', true)
            .ilike('name', `%${query}%`)
            .limit(3);

        const suggestions = [];

        // Add product name suggestions
        if (products) {
            products.forEach(product => {
                if (product.name.toLowerCase().includes(query.toLowerCase())) {
                    suggestions.push({
                        type: 'product',
                        text: product.name,
                        category: 'Products'
                    });
                }
            });
        }

        // Add category suggestions
        if (categories) {
            categories.forEach(category => {
                suggestions.push({
                    type: 'category',
                    text: category.name,
                    slug: category.slug,
                    category: 'Categories'
                });
            });
        }

        // Add tag suggestions from products
        if (products) {
            const matchingTags = new Set();
            products.forEach(product => {
                if (product.tags) {
                    product.tags.forEach((tag: string) => {
                        if (tag.toLowerCase().includes(query.toLowerCase())) {
                            matchingTags.add(tag);
                        }
                    });
                }
            });

            Array.from(matchingTags).slice(0, 5).forEach(tag => {
                suggestions.push({
                    type: 'tag',
                    text: tag,
                    category: 'Tags'
                });
            });
        }

        return suggestions.slice(0, 10);
    } catch (error) {
        console.error('Error getting search suggestions:', error);
        return [];
    }
}