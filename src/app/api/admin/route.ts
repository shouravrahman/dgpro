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
        const action = url.searchParams.get('action');

        switch (action) {
            case 'stats':
                const stats = await adminService.getPlatformStats();
                return NextResponse.json({ success: true, data: stats });

            case 'metrics':
                const metrics = await adminService.getDashboardMetrics();
                return NextResponse.json({ success: true, data: metrics });

            case 'health':
                const health = await adminService.getSystemHealth();
                return NextResponse.json({ success: true, data: health });

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Admin API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}