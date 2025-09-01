import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/lib/services/admin';
import { createClient } from '@/lib/supabase/server';

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
            status: url.searchParams.get('status') || undefined,
            priority: url.searchParams.get('priority') || undefined,
        };

        const reports = await adminService.getContentReports(filters);
        return NextResponse.json({ success: true, data: reports });
    } catch (error) {
        console.error('Admin reports API error:', error);
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
        const { action, report_ids, ...params } = body;

        // Log the admin action
        await adminService.createAuditLog({
            action: `bulk_report_${action}`,
            target_type: 'content_report',
            target_id: report_ids.join(','),
            details: params,
        });

        const result = await adminService.executeAdminAction({
            type: 'content',
            action,
            target_ids: report_ids,
            parameters: params,
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Admin reports action error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}