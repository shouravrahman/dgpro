import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MarketplaceService } from '@/lib/database/services/marketplace.service';
import { z } from 'zod';

// Validation schemas
const MarketplaceFiltersSchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  featured: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'price_low', 'price_high', 'popular', 'rating']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  tags: z.string().optional(), // Comma-separated tags
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const filters = MarketplaceFiltersSchema.parse(params);

    const supabase = createClient();
    const marketplaceService = new MarketplaceService(supabase);

    // Calculate offset for pagination
    const offset = (filters.page - 1) * filters.limit;

    // Build filter object for service
    const serviceFilters = {
      categoryId: filters.category,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      featured: filters.featured,
      search: filters.search,
      limit: filters.limit,
      offset,
    };

    // Get listings based on filters
    let listings;
    if (filters.search) {
      listings = await marketplaceService.searchListings(filters.search, serviceFilters);
    } else {
      listings = await marketplaceService.getMarketplaceListings(serviceFilters);
    }

    // Apply tag filtering if specified
    if (filters.tags) {
      const tagArray = filters.tags.split(',').map(tag => tag.trim().toLowerCase());
      listings = listings.filter(listing =>
        listing.products?.tags?.some(tag =>
          tagArray.includes(tag.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      listings = sortListings(listings, filters.sortBy);
    }

    // Get marketplace statistics
    const stats = await marketplaceService.getMarketplaceStats();

    // Get featured products separately if not filtering by featured
    const featuredProducts = filters.featured ? [] : await marketplaceService.getFeaturedListings(6);

    return NextResponse.json({
      success: true,
      data: {
        listings,
        featured: featuredProducts,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: listings.length,
          hasMore: listings.length === filters.limit,
        },
        stats,
        filters: {
          categories: await getAvailableCategories(supabase),
          priceRange: await getPriceRange(supabase),
          popularTags: await getPopularTags(supabase),
        }
      },
    });
  } catch (error) {
    console.error('Marketplace API error:', error);

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

// Helper function to sort listings
function sortListings(listings: any[], sortBy: string) {
  switch (sortBy) {
    case 'newest':
      return listings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case 'oldest':
      return listings.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    case 'price_low':
      return listings.sort((a, b) => a.price - b.price);
    case 'price_high':
      return listings.sort((a, b) => b.price - a.price);
    case 'popular':
      return listings.sort((a, b) => b.sales_count - a.sales_count);
    case 'rating':
      return listings.sort((a, b) => (b.products?.quality_score || 0) - (a.products?.quality_score || 0));
    default:
      return listings;
  }
}

// Helper function to get available categories
async function getAvailableCategories(supabase: any) {
  const { data, error } = await supabase
    .from('product_categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

// Helper function to get price range
async function getPriceRange(supabase: any) {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('price')
    .eq('status', 'active')
    .order('price');

  if (error || !data || data.length === 0) {
    return { min: 0, max: 1000 };
  }

  const prices = data.map(item => item.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}

// Helper function to get popular tags
async function getPopularTags(supabase: any) {
  const { data, error } = await supabase
    .from('products')
    .select('tags')
    .eq('status', 'published')
    .not('tags', 'is', null);

  if (error || !data) return [];

  // Flatten and count tags
  const tagCounts: Record<string, number> = {};
  data.forEach(product => {
    if (product.tags) {
      product.tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  // Return top 20 tags sorted by count
  return Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([tag, count]) => ({ tag, count }));
}
