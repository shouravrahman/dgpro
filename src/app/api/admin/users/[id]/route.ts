import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/lib/services/admin';
import { createClient } from '@/lib/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const userData = await adminService.getUserById(params.id);
        return NextResponse.json({ success: true, data: userData });
    } catch (error) {
        console.error('Admin user detail error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // Log the admin action
        await adminService.createAuditLog({
            action: 'update_user',
            target_type: 'user',
            target_id: params.id,
            details: body,
        });

        const updatedUser = await adminService.updateUser(params.id, body);
        return NextResponse.json({ success: true, data: updatedUser });
    } catch (error) {
        console.error('Admin user update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // Log the admin action
        await adminService.createAuditLog({
            action: 'suspend_user',
            target_type: 'user',
            target_id: params.id,
            details: { reason: 'Admin deletion' },
        });

        await adminService.suspendUser(params.id, 'Account deleted by admin');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin user delete error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}