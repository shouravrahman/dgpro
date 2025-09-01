import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/lib/services/admin';
import { createClient } from '@/lib/supabase/server';
import { ProductManagementFiltersSchema } from '@/lib/validations/admin';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const { data: adminUser } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

        if (!adminUser) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const url = new URL(request.url);
        const filters = {
            search: url.searchParams.get('search') || undefined,
            category: url.searchParams.get('category') || undefined,
            status: url.searchParams.get('status') as any || undefined,
            created_after: url.searchParams.get('created_after') || undefined,
            created_before: url.searchParams.get('created_before') || undefined,
            price_min: url.searchParams.get('price_min') ? parseFloat(url.searchParams.get('price_min')!) : undefined,
            price_max: url.searchParams.get('price_max') ? parseFloat(url.searchParams.get('price_max')!) : undefined,
            creator_id: url.searchParams.get('creator_id') || undefined,
            page: parseInt(url.searchParams.get('page') || '1'),
            limit: parseInt(url.searchParams.get('limit') || '20'),
        };

        const validatedFilters = ProductManagementFiltersSchema.parse(filters);
        const products = await adminService.getProducts(validatedFilters);

        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        console.error('Admin products API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const { data: adminUser } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

        if (!adminUser) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { action, product_ids, ...params } = body;

        // Log the admin action
        await adminService.createAuditLog({
            action: `bulk_product_${action}`,
            target_type: 'product',
            target_id: product_ids.join(','),
            details: params,
        });

        const result = await adminService.executeAdminAction({
            type: 'product',
            action,
            target_ids: product_ids,
            parameters: params,
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Admin products action error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}