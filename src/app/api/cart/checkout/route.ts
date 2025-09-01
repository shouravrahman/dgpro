import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { createCheckoutSessionSchema } from '@/lib/validations/cart';
import { sanitizeInput } from '@/lib/security/input-sanitization';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        // Sanitize and validate input
        const sanitizedBody = sanitizeInput(body);
        const validatedData = createCheckoutSessionSchema.parse(sanitizedBody);

        // Get user session
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({
                success: false,
                error: { message: 'Authentication required for checkout', code: 'UNAUTHORIZED' }
            }, { status: 401 });
        }

        // Verify cart ownership and get cart details
        const { data: cart, error: cartError } = await supabase
            .from('shopping_carts')
            .select(`
        *,
        items:cart_items(
          *,
          product:products(id, name, price),
          bundle:product_bundles(id, name, bundle_price)
        )
      `)
            .eq('id', validatedData.cart_id)
            .eq('user_id', user.id)
            .single();

        if (cartError || !cart) {
            return NextResponse.json({
                success: false,
                error: { message: 'Cart not found or unauthorized', code: 'CART_NOT_FOUND' }
            }, { status: 404 });
        }

        if (!cart.items || cart.items.length === 0) {
            return NextResponse.json({
                success: false,
                error: { message: 'Cart is empty', code: 'EMPTY_CART' }
            }, { status: 400 });
        }

        // Calculate totals
        let subtotal = 0;
        cart.items.forEach((item: any) => {
            subtotal += item.price * item.quantity;
        });

        let discountAmount = 0;
        const appliedCoupons = [];

        // Apply coupons if provided
        if (validatedData.applied_coupons && validatedData.applied_coupons.length > 0) {
            for (const couponCode of validatedData.applied_coupons) {
                const { data: validation } = await supabase
                    .rpc('validate_coupon', {
                        coupon_code: couponCode,
                        user_uuid: user.id,
                        cart_total: subtotal
                    });

                if (validation && validation[0] && validation[0].is_valid) {
                    const couponDiscount = validation[0].discount_amount;
                    discountAmount += couponDiscount;

                    // Get coupon details
                    const { data: coupon } = await supabase
                        .from('coupons')
                        .select('code, discount_type')
                        .eq('id', validation[0].coupon_id)
                        .single();

                    if (coupon) {
                        appliedCoupons.push({
                            coupon_id: validation[0].coupon_id,
                            code: coupon.code,
                            discount_amount: couponDiscount,
                            discount_type: coupon.discount_type,
                        });
                    }
                }
            }
        }

        // Calculate tax (simplified - in real app, use tax service)
        const taxAmount = 0; // TODO: Implement tax calculation based on billing address
        const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount);

        // Create checkout session
        const { data: checkoutSession, error: sessionError } = await supabase
            .from('checkout_sessions')
            .insert({
                cart_id: validatart_id,
                user_id: user.id,
                status: 'pending',
                billing_email: validatedData.billing_email,
                billing_name: validatedData.billing_name,
                billing_address: validatedData.billing_address,
                ent_method: validatedData.payment_method,
                subtotal,
                discount_amount: discountAmount,
                ax_amount: taxAmount,
                total_amount: totalAmount,
                currency: 'USD',
                applied_coupons: appliedCoupons,
                metadata: validatedData.metadata,
                expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
            })
            .select()
            .single();

        if (sessionError) throw sessionError;

        // TODO: Create payment session with LemonSqueezy or Stripe
        // For now, we'll return the checkout session

        return NextResponse.json({
            success: true,
            data: {
                checkout_session: checkoutSession,
                cart_summary: {
                    items: cart.items,
                    subtotal,
                    discount_amount: discountAmount,
                    tax_amount: taxAmount,
                    total_amount: totalAmount,
                    applied_coupons: appliedCoupons,
                },
            },
        });

    } catch (error) {
        console.error('Create checkout session error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: { message: 'Invalid checkout data', code: 'VALIDATION_ERROR', details: error.errors }
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: { message: 'Failed to create checkout session', code: 'CHECKOUT_SESSION_ERROR' }
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json({
                success: false,
                error: { message: 'Session ID is required', code: 'MISSING_SESSION_ID' }
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

        // Get checkout session
        const { data: checkoutSession, error } = await supabase
            .from('checkout_sessions')
            .select(`
        *,
        cart:shopping_carts(
          *,
          items:cart_items(
            *,
            product:products(id, name, price, assets),
            bundle:product_bundles(id, name, bundle_price)
          )
        )
      `)
            .eq('id', sessionId)
            .eq('user_id', user.id)
            .single();

        if (error || !checkoutSession) {
            return NextResponse.json({
                success: false,
                error: { message: 'Checkout session not found', code: 'SESSION_NOT_FOUND' }
            }, { status: 404 });
        }

        // Check if session is expired
        if (new Date(checkoutSession.expires_at) < new Date()) {
            return NextResponse.json({
                success: false,
                error: { message: 'Checkout session has expired', code: 'SESSION_EXPIRED' }
            }, { status: 410 });
        }

        return NextResponse.json({
            success: true,
            data: {
                checkout_session: checkoutSession,
            },
        });

    } catch (error) {
        console.error('Get checkout session error:', error);

        return NextResponse.json({
            success: false,
            error: { message: 'Failed to fetch checkout session', code: 'FETCH_SESSION_ERROR' }
        }, { status: 500 });
    }
}