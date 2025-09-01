import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { addToCartSchema, cartQuerySchema } from '@/lib/validations/cart';
import { sanitizeInput } from '@/lib/security/input-sanitization';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        // Validate query parameters
        const queryData = cartQuerySchema.parse({
            include_recommendations: searchParams.get('include_recommendations') === 'true',
            include_items: searchParams.get('include_items') === 'true',
        });

        // Get user session
        const { data: { user } } = await supabase.auth.getUser();

        // Get or create cart
        let cart;
        if (user) {
            // Get user's cart
            const { data: existingCart } = await supabase
                .from('shopping_carts')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (!existingCart) {
                // Create new cart for user
                const { data: newCart, error } = await supabase
                    .from('shopping_carts')
                    .insert({
                        user_id: user.id,
                        total_amount: 0,
                        currency: 'USD',
                    })
                    .select()
                    .single();

                if (error) throw error;
                cart = newCart;
            } else {
                cart = existingCart;
            }
        } else {
            // Handle guest cart with session ID
            const sessionId = request.headers.get('x-session-id');
            if (!sessionId) {
                return NextResponse.json({
                    success: false,
                    error: { message: 'Session ID required for guest cart', code: 'MISSING_SESSION_ID' }
                }, { status: 400 });
            }

            const { data: existingCart } = await supabase
                .from('shopping_carts')
                .select('*')
                .eq('session_id', sessionId)
                .single();

            if (!existingCart) {
                // Create new guest cart
                const { data: newCart, error } = await supabase
                    .from('shopping_carts')
                    .insert({
                        session_id: sessionId,
                        total_amount: 0,
                        currency: 'USD',
                    })
                    .select()
                    .single();

                if (error) throw error;
                cart = newCart;
            } else {
                cart = existingCart;
            }
        }

        // Get cart items if requested
        let items = [];
        if (queryData.include_items) {
            const { data: cartItems, error: itemsError } = await supabase
                .from('cart_items')
                .select(`
          *,
          product:products(id, name, description, assets, category_id, price),
          bundle:product_bundles(id, name, description, bundle_price)
        `)
                .eq('cart_id', cart.id);

            if (itemsError) throw itemsError;
            items = cartItems || [];
        }

        // Get recommendations if requested
        let recommendations = [];
        if (queryData.include_recommendations && items.length > 0) {
            const { data: recs } = await supabase.rpc('get_cart_recommendations', {
                cart_uuid: cart.id,
                limit_count: 5
            });
            recommendations = recs || [];
        }

        return NextResponse.json({
            success: true,
            data: {
                cart: {
                    ...cart,
                    items,
                },
                recommendations,
            },
        });

    } catch (error) {
        console.error('Cart fetch error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: { message: 'Invalid query parameters', code: 'VALIDATION_ERROR', details: error.errors }
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: { message: 'Failed to fetch cart', code: 'CART_FETCH_ERROR' }
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const body = await request.json();

        // Sanitize and validate input
        const sanitizedBody = sanitizeInput(body);
        const validatedData = addToCartSchema.parse(sanitizedBody);

        // Get user session
        const { data: { user } } = await supabase.auth.getUser();

        // Get or create cart
        let cart;
        if (user) {
            const { data: existingCart } = await supabase
                .from('shopping_carts')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (!existingCart) {
                const { data: newCart, error } = await supabase
                    .from('shopping_carts')
                    .insert({
                        user_id: user.id,
                        total_amount: 0,
                        currency: 'USD',
                    })
                    .select()
                    .single();

                if (error) throw error;
                cart = newCart;
            } else {
                cart = existingCart;
            }
        } else {
            const sessionId = request.headers.get('x-session-id');
            if (!sessionId) {
                return NextResponse.json({
                    success: false,
                    error: { message: 'Session ID required for guest cart', code: 'MISSING_SESSION_ID' }
                }, { status: 400 });
            }

            const { data: existingCart } = await supabase
                .from('shopping_carts')
                .select('*')
                .eq('session_id', sessionId)
                .single();

            if (!existingCart) {
                const { data: newCart, error } = await supabase
                    .from('shopping_carts')
                    .insert({
                        session_id: sessionId,
                        total_amount: 0,
                        currency: 'USD',
                    })
                    .select()
                    .single();

                if (error) throw error;
                cart = newCart;
            } else {
                cart = existingCart;
            }
        }

        // Get product or bundle price
        let price = 0;
        if (validatedData.product_id) {
            const { data: product, error } = await supabase
                .from('products')
                .select('price')
                .eq('id', validatedData.product_id)
                .eq('status', 'published')
                .single();

            if (error || !product) {
                return NextResponse.json({
                    success: false,
                    error: { message: 'Product not found or not available', code: 'PRODUCT_NOT_FOUND' }
                }, { status: 404 });
            }
            price = product.price;
        } else if (validatedData.bundle_id) {
            const { data: bundle, error } = await supabase
                .from('product_bundles')
                .select('bundle_price')
                .eq('id', validatedData.bundle_id)
                .eq('status', 'active')
                .single();

            if (error || !bundle) {
                return NextResponse.json({
                    success: false,
                    error: { message: 'Bundle not found or not available', code: 'BUNDLE_NOT_FOUND' }
                }, { status: 404 });
            }
            price = bundle.bundle_price;
        }

        // Check if item already exists in cart
        const existingItemQuery = supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', cart.id);

        if (validatedData.product_id) {
            existingItemQuery.eq('product_id', validatedData.product_id);
        } else {
            existingItemQuery.eq('bundle_id', validatedData.bundle_id);
        }

        const { data: existingItem } = await existingItemQuery.single();

        let cartItem;
        if (existingItem) {
            // Update quantity
            const { data: updatedItem, error } = await supabase
                .from('cart_items')
                .update({
                    quantity: existingItem.quantity + validatedData.quantity,
                })
                .eq('id', existingItem.id)
                .select(`
          *,
          product:products(id, name, description, assets, category_id),
          bundle:product_bundles(id, name, description, bundle_price)
        `)
                .single();

            if (error) throw error;
            cartItem = updatedItem;
        } else {
            // Add new item
            const { data: newItem, error } = await supabase
                .from('cart_items')
                .insert({
                    cart_id: cart.id,
                    product_id: validatedData.product_id,
                    bundle_id: validatedData.bundle_id,
                    quantity: validatedData.quantity,
                    price,
                    currency: 'USD',
                })
                .select(`
          *,
          product:products(id, name, description, assets, category_id),
          bundle:product_bundles(id, name, description, bundle_price)
        `)
                .single();

            if (error) throw error;
            cartItem = newItem;
        }

        // Calculate cart total (handled by trigger)
        const { data: updatedCart } = await supabase
            .from('shopping_carts')
            .select('*')
            .eq('id', cart.id)
            .single();

        return NextResponse.json({
            success: true,
            data: {
                cart_item: cartItem,
                cart: updatedCart,
            },
        });

    } catch (error) {
        console.error('Add to cart error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: { message: 'Invalid input data', code: 'VALIDATION_ERROR', details: error.errors }
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: { message: 'Failed to add item to cart', code: 'ADD_TO_CART_ERROR' }
        }, { status: 500 });
    }
}