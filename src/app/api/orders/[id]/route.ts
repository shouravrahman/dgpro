import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { lemonSqueezyClient } from '@/lib/lemonsqueezy/client';

interface RouteParams {
    params: {
        id: string;
    };
}

// GET /api/orders/[id] - Get specific order details
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const orderId = params.id;

        // Get order from database
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(`
        *,
        products:product_id (
          name,
          description,
          category,
          assets
        )
      `)
            .eq('id', orderId)
            .eq('user_id', user.id) // Ensure user owns this order
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Get detailed LemonSqueezy order data
        let lemonSqueezyData = null;
        if (order.lemonsqueezy_order_id) {
            const lsOrderResult = await lemonSqueezyClient.getOrderDetails(
                order.lemonsqueezy_order_id
            );

            if (lsOrderResult.success) {
                lemonSqueezyData = lsOrderResult.data;
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                ...order,
                lemonSqueezyData,
            },
        });
    } catch (error) {
        console.error('Order GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}