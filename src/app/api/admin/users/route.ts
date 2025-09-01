import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/lib/services/admin';
import { createClient } from '@/lib/supabase/server';
import { UserManagementFiltersSchema } from '@/lib/validations/admin';

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
            role: url.searchParams.get('role') || undefined,
            subscription_tier: url.searchParams.get('subscription_tier') || undefined,
            status: url.searchParams.get('status') as any || undefined,
            created_after: url.searchParams.get('created_after') || undefined,
            created_before: url.searchParams.get('created_before') || undefined,
            last_login_after: url.searchParams.get('last_login_after') || undefined,
            last_login_before: url.searchParams.get('last_login_before') || undefined,
            page: parseInt(url.searchParams.get('page') || '1'),
            limit: parseInt(url.searchParams.get('limit') || '20'),
        };

        const validatedFilters = UserManagementFiltersSchema.parse(filters);
        const users = await adminService.getUsers(validatedFilters);

        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        console.error('Admin users API error:', error);
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
        const { action, user_ids, ...params } = body;

        // Log the admin action
        await adminService.createAuditLog({
            action: `bulk_user_${action}`,
            target_type: 'user',
            target_id: user_ids.join(','),
            details: params,
        });

        const result = await adminService.executeAdminAction({
            type: 'user',
            action,
            target_ids: user_ids,
            parameters: params,
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Admin users action error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}