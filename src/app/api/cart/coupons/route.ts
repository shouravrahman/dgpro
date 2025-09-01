import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { applyCouponSchema } from '@/lib/validations/cart';
import { sanitizeInput } from '@/lib/security/input-sanitization';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        // Sanitize and validate input
        const sanitizedBody = sanitizeInput(body);
        const validatedData = applyCouponSchema.parse(sanitizedBody);

        // Get user session
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({
                success: false,
                error: { message: 'Authentication required to apply coupons', code: 'UNAUTHORIZED' }
            }, { status: 401 });
        }

        // Get user's cart
        const { data: cart, error: cartError } = await supabase
            .from('shopping_carts')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (cartError || !cart) {
            return NextResponse.json({
                success: false,
                error: { message: 'Cart not found', code: 'CART_NOT_FOUND' }
            }, { status: 404 });
        }

        // Validate coupon using database function
        const { data: validation, error: validationError } = await supabase
            .rpc('validate_coupon', {
                coupon_code: validatedData.coupon_code,
                user_uuid: user.id,
                cart_total: cart.total_amount
            });

        if (validationError) throw validationError;

        const validationResult = validation[0];

        if (!validationResult.is_valid) {
            return NextResponse.json({
                success: false,
                error: {
                    message: validationResult.error_message || 'Invalid coupon',
                    code: 'INVALID_COUPON'
                }
            }, { status: 400 });
        }

        // Record coupon usage
        const { error: usageError } = await supabase
            .from('coupon_usage')
            .insert({
                coupon_id: validationResult.coupon_id,
                user_id: user.id,
                cart_id: cart.id,
                discount_amount: validationResult.discount_amount,
            });

        if (usageError) {
            // Check if it's a duplicate usage error
            if (usageError.code === '23505') {
                return NextResponse.json({
                    success: false,
                    error: { message: 'You have already used this coupon', code: 'COUPON_ALREADY_USED' }
                }, { status: 400 });
            }
            throw usageError;
        }

        // Update coupon usage count
        await supabase
            .from('coupons')
            .update({
                usage_count: supabase.raw('usage_count + 1')
            })
            .eq('id', validationResult.coupon_id);

        // Get coupon details for response
        const { data: coupon } = await supabase
            .from('coupons')
            .select('code, name, discount_type, discount_value')
            .eq('id', validationResult.coupon_id)
            .single();

        return NextResponse.json({
            success: true,
            data: {
                coupon: {
                    ...coupon,
                    discount_amount: validationResult.discount_amount,
                },
                cart_total: cart.total_amount,
                discount_amount: validationResult.discount_amount,
                final_total: cart.total_amount - validationResult.discount_amount,
            },
        });

    } catch (error) {
        console.error('Apply coupon error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: { message: 'Invalid coupon code format', code: 'VALIDATION_ERROR', details: error.errors }
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: { message: 'Failed to apply coupon', code: 'APPLY_COUPON_ERROR' }
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = createClient();
        const { searchParams } = new URL(request.url);
        const couponCode = searchParams.get('code');

        if (!couponCode) {
            return NextResponse.json({
                success: false,
                error: { message: 'Coupon code is required', code: 'MISSING_COUPON_CODE' }
            }, { status: 400 });
        }

        // Get user session
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({
                success: false,
                error: { message: 'Authentication required', code: 'UNAUTHORIZED' }
            }, { status: 401 });
        }

        // Get user's cart
        const { data: cart, error: cartError } = await supabase
            .from('shopping_carts')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (cartError || !cart) {
            return NextResponse.json({
                success: false,
                error: { message: 'Cart not found', code: 'CART_NOT_FOUND' }
            }, { status: 404 });
        }

        // Get coupon ID
        const { data: coupon, error: couponError } = await supabase
            .from('coupons')
            .select('id')
            .eq('code', couponCode.toUpperCase())
            .single();

        if (couponError || !coupon) {
            return NextResponse.json({
                success: false,
                error: { message: 'Coupon not found', code: 'COUPON_NOT_FOUND' }
            }, { status: 404 });
        }

        // Remove coupon usage
        const { error: deleteError } = await supabase
            .from('coupon_usage')
            .delete()
            .eq('coupon_id', coupon.id)
            .eq('user_id', user.id)
            .eq('cart_id', cart.id);

        if (deleteError) throw deleteError;

        // Decrease coupon usage count
        await supabase
            .from('coupons')
            .update({
                usage_count: supabase.raw('GREATEST(usage_count - 1, 0)')
            })
            .eq('id', coupon.id);

        return NextResponse.json({
            success: true,
            data: {
                message: 'Coupon removed successfully',
                cart_total: cart.total_amount,
            },
        });

    } catch (error) {
        console.error('Remove coupon error:', error);

        return NextResponse.json({
            success: false,
            error: { message: 'Failed to remove coupon', code: 'REMOVE_COUPON_ERROR' }
        }, { status: 500 });
    }
}