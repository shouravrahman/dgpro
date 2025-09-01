import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MarketplaceService } from '@/lib/database/services/marketplace.service';
import { z } from 'zod';

const FeaturedFiltersSchema = z.object({
    limit: z.coerce.number().min(1).max(20).default(10),
    category: z.string().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const params = Object.fromEntries(searchParams.entries());

        const filters = FeaturedFiltersSchema.parse(params);

        const supabase = createClient();
        const marketplaceService = new MarketplaceService(supabase);

        const featuredListings = await marketplaceService.getFeaturedListings(filters.limit);

        // Filter by category if specified
        const filteredListings = filters.category
            ? featuredListings.filter(listing =>
                listing.products?.product_categories?.slug === filters.category
            )
            : featuredListings;

        return NextResponse.json({
            success: true,
            data: filteredListings,
        });
    } catch (error) {
        console.error('Featured products API error:', error);

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

// POST endpoint to feature a product (admin only)
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
        const { listingId, featured, featuredUntil } = body;

        if (!listingId || typeof featured !== 'boolean') {
            return NextResponse.json(
                { success: false, error: 'Invalid request body' },
                { status: 400 }
            );
        }

        const marketplaceService = new MarketplaceService(supabase);

        const updateData: any = { is_featured: featured };
        if (featured && featuredUntil) {
            updateData.featured_until = featuredUntil;
        }

        const updatedListing = await marketplaceService.updateListing(listingId, updateData);

        return NextResponse.json({
            success: true,
            data: updatedListing,
        });
    } catch (error) {
        console.error('Feature product API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}