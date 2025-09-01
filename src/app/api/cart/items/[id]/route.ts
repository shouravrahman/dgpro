import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { updateCartItemSchema } from '@/lib/validations/cart';
import { sanitizeInput } from '@/lib/security/input-sanitization';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();
        const body = await request.json();

        // Sanitize and validate input
        const sanitizedBody = sanitizeInput(body);
        const validatedData = updateCartItemSchema.parse(sanitizedBody);

        // Get user session
        const { data: { user } } = await supabase.auth.getUser();

        // Verify cart item ownership
        const cartItemQuery = supabase
            .from('cart_items')
            .select(`
        *,
        cart:shopping_carts(id, user_id, session_id)
      `)
            .eq('id', params.id)
            .single();

        const { data: cartItem, error: fetchError } = await cartItemQuery;

        if (fetchError || !cartItem) {
            return NextResponse.json({
                success: false,
                error: { message: 'Cart item not found', code: 'CART_ITEM_NOT_FOUND' }
            }, { status: 404 });
        }

        // Check ownership
        const sessionId = request.headers.get('x-session-id');
        const isOwner = user
            ? cartItem.cart.user_id === user.id
            : cartItem.cart.session_id === sessionId;

        if (!isOwner) {
            return NextResponse.json({
                success: false,
                error: { message: 'Unauthorized access to cart item', code: 'UNAUTHORIZED' }
            }, { status: 403 });
        }

        // Update cart item
        const { data: updatedItem, error: updateError } = await supabase
            .from('cart_items')
            .update({
                quantity: validatedData.quantity,
            })
            .eq('id', params.id)
            .select(`
        *,
        product:products(id, name, description, assets, category_id),
        bundle:product_bundles(id, name, description, bundle_price)
      `)
            .single();

        if (updateError) throw updateError;

        // Get updated cart total
        const { data: updatedCart } = await supabase
            .from('shopping_carts')
            .select('*')
            .eq('id', cartItem.cart.id)
            .single();

        return NextResponse.json({
            success: true,
            data: {
                cart_item: updatedItem,
                cart: updatedCart,
            },
        });

    } catch (error) {
        console.error('Update cart item error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: { message: 'Invalid input data', code: 'VALIDATION_ERROR', details: error.errors }
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: { message: 'Failed to update cart item', code: 'UPDATE_CART_ITEM_ERROR' }
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();

        // Get user session
        const { data: { user } } = await supabase.auth.getUser();

        // Verify cart item ownership
        const cartItemQuery = supabase
            .from('cart_items')
            .select(`
        *,
        cart:shopping_carts(id, user_id, session_id)
      `)
            .eq('id', params.id)
            .single();

        const { data: cartItem, error: fetchError } = await cartItemQuery;

        if (fetchError || !cartItem) {
            return NextResponse.json({
                success: false,
                error: { message: 'Cart item not found', code: 'CART_ITEM_NOT_FOUND' }
            }, { status: 404 });
        }

        // Check ownership
        const sessionId = request.headers.get('x-session-id');
        const isOwner = user
            ? cartItem.cart.user_id === user.id
            : cartItem.cart.session_id === sessionId;

        if (!isOwner) {
            return NextResponse.json({
                success: false,
                error: { message: 'Unauthorized access to cart item', code: 'UNAUTHORIZED' }
            }, { status: 403 });
        }

        // Delete cart item
        const { error: deleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', params.id);

        if (deleteError) throw deleteError;

        // Get updated cart total
        const { data: updatedCart } = await supabase
            .from('shopping_carts')
            .select('*')
            .eq('id', cartItem.cart.id)
            .single();

        return NextResponse.json({
            success: true,
            data: {
                cart: updatedCart,
                removed_item_id: params.id,
            },
        });

    } catch (error) {
        console.error('Delete cart item error:', error);

        return NextResponse.json({
            success: false,
            error: { message: 'Failed to remove cart item', code: 'DELETE_CART_ITEM_ERROR' }
        }, { status: 500 });
    }
}