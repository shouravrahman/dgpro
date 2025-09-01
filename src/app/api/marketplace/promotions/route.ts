import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const PromotionSchema = z.object({
    type: z.enum(['featured', 'discount', 'bundle', 'flash_sale']),
    productIds: z.array(z.string()).min(1),
    title: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    discountPercentage: z.number().min(0).max(100).optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    isActive: z.boolean().default(true),
});

const PromotionFiltersSchema = z.object({
    type: z.enum(['featured', 'discount', 'bundle', 'flash_sale']).optional(),
    active: z.coerce.boolean().optional(),
    limit: z.coerce.number().min(1).max(50).default(20),
    offset: z.coerce.number().min(0).default(0),
});

// GET - Fetch active promotions
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const params = Object.fromEntries(searchParams.entries());

        const filters = PromotionFiltersSchema.parse(params);

        const supabase = createClient();

        // Build query for promotions
        let query = supabase
            .from('promotions')
            .select(`
        *,
        promotion_products (
          product_id,
          products (
            id,
            name,
            short_description,
            assets,
            pricing_type,
            price
          )
        )
      `)
            .order('created_at', { ascending: false });

        if (filters.type) {
            query = query.eq('type', filters.type);
        }

        if (filters.active !== undefined) {
            query = query.eq('is_active', filters.active);
        }

        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        if (filters.offset) {
            query = query.range(filters.offset, filters.offset + filters.limit - 1);
        }

        const { data: promotions, error } = await query;

        if (error) throw error;

        // Get current active promotions
        const now = new Date().toISOString();
        const activePromotions = (promotions || []).filter(promo =>
            promo.is_active &&
            new Date(promo.start_date) <= new Date(now) &&
            new Date(promo.end_date) >= new Date(now)
        );

        // Get featured products specifically
        const { data: featuredListings } = await supabase
            .from('marketplace_listings')
            .select(`
        *,
        products (
          id,
          name,
          short_description,
          assets,
          tags,
          quality_score,
          product_categories (
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
            .gte('featured_until', now)
            .order('created_at', { ascending: false })
            .limit(10);

        return NextResponse.json({
            success: true,
            data: {
                promotions: promotions || [],
                activePromotions,
                featuredProducts: featuredListings || [],
                stats: {
                    totalPromotions: promotions?.length || 0,
                    activePromotions: activePromotions.length,
                    featuredProducts: featuredListings?.length || 0,
                }
            },
        });
    } catch (error) {
        console.error('Promotions API error:', error);

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

// POST - Create new promotion (admin only)
export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();

        // Check if user is admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!userData || !['admin', 'super_admin'].includes(userData.role)) {
            return NextResponse.json(
                { success: false, error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const promotionData = PromotionSchema.parse(body);

        // Validate dates
        const startDate = new Date(promotionData.startDate);
        const endDate = new Date(promotionData.endDate);

        if (endDate <= startDate) {
            return NextResponse.json(
                { success: false, error: 'End date must be after start date' },
                { status: 400 }
            );
        }

        // Create promotion
        const { data: promotion, error: promotionError } = await supabase
            .from('promotions')
            .insert({
                type: promotionData.type,
                title: promotionData.title,
                description: promotionData.description,
                discount_percentage: promotionData.discountPercentage,
                start_date: promotionData.startDate,
                end_date: promotionData.endDate,
                is_active: promotionData.isActive,
                created_by: user.id,
            })
            .select()
            .single();

        if (promotionError) throw promotionError;

        // Add products to promotion
        if (promotionData.productIds.length > 0) {
            const promotionProducts = promotionData.productIds.map(productId => ({
                promotion_id: promotion.id,
                product_id: productId,
            }));

            const { error: productsError } = await supabase
                .from('promotion_products')
                .insert(promotionProducts);

            if (productsError) throw productsError;
        }

        // If it's a featured promotion, update marketplace listings
        if (promotionData.type === 'featured') {
            const { error: updateError } = await supabase
                .from('marketplace_listings')
                .update({
                    is_featured: true,
                    featured_until: promotionData.endDate,
                })
                .in('product_id', promotionData.productIds);

            if (updateError) throw updateError;
        }

        // If it's a discount promotion, update product prices
        if (promotionData.type === 'discount' && promotionData.discountPercentage) {
            for (const productId of promotionData.productIds) {
                const { data: listing } = await supabase
                    .from('marketplace_listings')
                    .select('price, original_price')
                    .eq('product_id', productId)
                    .single();

                if (listing) {
                    const originalPrice = listing.original_price || listing.price;
                    const discountedPrice = originalPrice * (1 - promotionData.discountPercentage / 100);

                    await supabase
                        .from('marketplace_listings')
                        .update({
                            price: discountedPrice,
                            original_price: originalPrice,
                            discount_percentage: promotionData.discountPercentage,
                        })
                        .eq('product_id', productId);
                }
            }
        }

        return NextResponse.json({
            success: true,
            data: promotion,
        });
    } catch (error) {
        console.error('Create promotion error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid promotion data',
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