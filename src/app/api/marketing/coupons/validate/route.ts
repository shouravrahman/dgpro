import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MarketingService } from '@/lib/services/marketing';
import { marketingValidations } from '@/lib/validations/marketing';
import { z } from 'zod';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validate request body
        const validatedData = marketingValidations.validateCoupon.parse(body);

        const marketingService = new MarketingService();
        const coupon = await marketingService.validateCoupon(
            validatedData.code,
            validatedData.cart_total,
            user.id
        );

        if (!coupon) {
            return NextResponse.json({
                success: false,
                error: 'Invalid or expired coupon code',
            }, { status: 400 });
        }

        // Calculate discount amount
        let discountAmount = 0;
        if (coupon.type === 'percentage') {
            discountAmount = (validatedData.cart_total * coupon.value) / 100;
            if (coupon.maximum_discount && discountAmount > coupon.maximum_discount) {
                discountAmount = coupon.maximum_discount;
            }
        } else if (coupon.type === 'fixed_amount') {
            discountAmount = Math.min(coupon.value, validatedData.cart_total);
        }

        return NextResponse.json({
            success: true,
            data: {
                coupon,
                discount_amount: discountAmount,
                final_total: validatedData.cart_total - discountAmount,
            },
        });
    } catch (error) {
        console.error('Error validating coupon:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to validate coupon' },
            { status: 500 }
        );
    }
}