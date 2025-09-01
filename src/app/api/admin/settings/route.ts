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

        const settings = await adminService.getSystemSettings();
        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        console.error('Admin settings API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin with proper permissions
        const { data: adminUser } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

        if (!adminUser || !['super_admin', 'admin'].includes(adminUser.role)) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const body = await request.json();
        const { settings } = body;

        const results = [];
        for (const setting of settings) {
            // Log the admin action
            await adminService.createAuditLog({
                action: 'update_system_setting',
                target_type: 'system_setting',
                target_id: setting.id,
                details: { old_value: setting.old_value, new_value: setting.value },
            });

            const updated = await adminService.updateSystemSetting(setting.id, {
                value: setting.value,
                updated_by: adminUser.id,
            });
            results.push(updated);
        }

        return NextResponse.json({ success: true, data: results });
    } catch (error) {
        console.error('Admin settings update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}