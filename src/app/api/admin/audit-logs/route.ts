import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/lib/services/admin';
import { createClient } from '@/lib/supabase/server';
import { AuditLogFiltersSchema } from '@/lib/validations/admin';

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
            admin_id: url.searchParams.get('admin_id') || undefined,
            action: url.searchParams.get('action') || undefined,
            target_type: url.searchParams.get('target_type') || undefined,
            date_from: url.searchParams.get('date_from') || undefined,
            date_to: url.searchParams.get('date_to') || undefined,
            page: parseInt(url.searchParams.get('page') || '1'),
            limit: parseInt(url.searchParams.get('limit') || '20'),
        };

        const validatedFilters = AuditLogFiltersSchema.parse(filters);
        const logs = await adminService.getAuditLogs(validatedFilters);

        return NextResponse.json({ success: true, data: logs });
    } catch (error) {
        console.error('Admin audit logs API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}