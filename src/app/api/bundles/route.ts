import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { bundleBuilderSchema } from '@/lib/validations/cart';
import { sanitizeInput } from '@/lib/security/input-sanitization';

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const body = await request.json();

        // Sanitize and validate input
        const sanitizedBody = sanitizeInput(body);
        const validatedData = bundleBuilderSchema.parse(sanitizedBody);

        // Get user session
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({
                success: false,
                error: { message: 'Authentication required to create bundles', code: 'UNAUTHORIZED' }
            }, { status: 401 });
        }

        // Verify all selected products exist and are published
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, name, price')
            .in('id', validatedData.selected_items)
            .eq('status', 'published');

        if (productsError) throw productsError;

        if (!products || products.length !== validatedData.selected_items.length) {
            return NextResponse.json({
                success: false,
                error: { message: 'Some selected products are not available', code: 'INVALID_PRODUCTS' }
            }, { status: 400 });
        }

        // Calculate bundle pricing
        const originalPrice = products.reduce((sum, product) => sum + product.price, 0);
        const discountAmount = originalPrice * (validatedData.bundle_discount / 100);
        const bundlePrice = originalPrice - discountAmount;

        // Create bundle
        const { data: bundle, error: bundleError } = await supabase
            .from('product_bundles')
            .insert({
                name: validatedData.name,
                slug: validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description: validatedData.description,
                creator_id: user.id,
                bundle_price: bundlePrice,
                original_price: originalPrice,
                discount_percentage: validatedData.bundle_discount,
                currency: 'USD',
                status: 'active',
                is_featured: false,
                sales_count: 0,
                metadata: {
                    created_via: 'bundle_builder',
                    discount_applied: validatedData.bundle_discount,
                },
            })
            .select()
            .single();

        if (bundleError) throw bundleError;

        // Add bundle items
        const bundleItems = validatedData.selected_items.map((productId, index) => ({
            bundle_id: bundle.id,
            product_id: productId,
            sort_order: index,
        }));

        const { error: itemsError } = await supabase
            .from('bundle_items')
            .insert(bundleItems);

        if (itemsError) throw itemsError;

        // Get complete bundle data with products
        const { data: completeBundle, error: fetchError } = await supabase
            .from('product_bundles')
            .select(`
        *,
        items:bundle_items(
          *,
          product:products(id, name, price, assets)
        )
      `)
            .eq('id', bundle.id)
            .single();

        if (fetchError) throw fetchError;

        return NextResponse.json({
            success: true,
            data: {
                bundle: completeBundle,
                savings: discountAmount,
                original_price: originalPrice,
            },
        });

    } catch (error) {
        console.error('Create bundle error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: { message: 'Invalid bundle data', code: 'VALIDATION_ERROR', details: error.errors }
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: { message: 'Failed to create bundle', code: 'CREATE_BUNDLE_ERROR' }
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50);
        const category = searchParams.get('category');
        const featured = searchParams.get('featured') === 'true';

        const offset = (page - 1) * limit;

        // Build query
        let query = supabase
            .from('product_bundles')
            .select(`
        *,
        items:bundle_items(
          *,
          product:products(id, name, price, assets, category_id)
        ),
        creator:users(id, full_name)
      `)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (featured) {
            query = query.eq('is_featured', true);
        }

        const { data: bundles, error } = await query;

        if (error) throw error;

        // Filter by category if specified (check products in bundle)
        let filteredBundles = bundles || [];
        if (category) {
            filteredBundles = bundles?.filter(bundle =>
                bundle.items?.some((item: any) => item.product?.category_id === category)
            ) || [];
        }

        return NextResponse.json({
            success: true,
            data: {
                bundles: filteredBundles,
                pagination: {
                    page,
                    limit,
                    total: filteredBundles.length,
                    hasMore: filteredBundles.length === limit,
                },
            },
        });

    } catch (error) {
        console.error('Fetch bundles error:', error);

        return NextResponse.json({
            success: false,
            error: { message: 'Failed to fetch bundles', code: 'FETCH_BUNDLES_ERROR' }
        }, { status: 500 });
    }
}