import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { lemonSqueezyClient } from '@/lib/lemonsqueezy/client';

// GET /api/orders - Get user's order history
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        // Get orders from database
        const { data: orders, error: ordersError, count } = await supabase
            .from('orders')
            .select(`
        *,
        products:product_id (
          name,
          description
        )
      `, { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (ordersError) {
            console.error('Failed to get orders:', ordersError);
            return NextResponse.json(
                { error: 'Failed to get orders' },
                { status: 500 }
            );
        }

        // Get user's LemonSqueezy customer ID for additional order details
        const { data: userData } = await supabase
            .from('users')
            .select('lemonsqueezy_customer_id')
            .eq('id', user.id)
            .single();

        // Enrich orders with LemonSqueezy data if available
        const enrichedOrders = await Promise.all(
            orders.map(async (order) => {
                if (order.lemonsqueezy_order_id) {
                    const lsOrderResult = await lemonSqueezyClient.getOrderDetails(
                        order.lemonsqueezy_order_id
                    );

                    return {
                        ...order,
                        lemonSqueezyData: lsOrderResult.success ? lsOrderResult.data : null,
                    };
                }
                return order;
            })
        );

        return NextResponse.json({
            success: true,
            data: {
                orders: enrichedOrders,
                pagination: {
                    page,
                    limit,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / limit),
                },
            },
        });
    } catch (error) {
        console.error('Orders GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}