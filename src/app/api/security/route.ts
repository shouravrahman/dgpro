import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { securityMonitoring } from '@/lib/security/monitoring';
import { EnhancedRateLimiter } from '@/lib/security/rate-limiter';
import { auditLogger } from '@/lib/security/audit-logger';

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
            case 'metrics':
                const metrics = await securityMonitoring.getSecurityMetrics();
                return NextResponse.json({ success: true, data: metrics });

            case 'alerts':
                const limit = parseInt(url.searchParams.get('limit') || '50');
                const alerts = securityMonitoring.getRecentAlerts(limit);
                return NextResponse.json({ success: true, data: alerts });

            case 'blocked_ips':
                const blockedIPs = EnhancedRateLimiter.getBlockedIPs();
                return NextResponse.json({ success: true, data: blockedIPs });

            case 'health_check':
                const healthCheck = await securityMonitoring.performSecurityHealthCheck();
                return NextResponse.json({ success: true, data: healthCheck });

            case 'audit_logs':
                const filters = {
                    userId: url.searchParams.get('user_id') || undefined,
                    action: url.searchParams.get('action_type') || undefined,
                    resourceType: url.searchParams.get('resource_type') || undefined,
                    severity: url.searchParams.get('severity') || undefined,
                    startDate: url.searchParams.get('start_date') || undefined,
                    endDate: url.searchParams.get('end_date') || undefined,
                    limit: parseInt(url.searchParams.get('limit') || '100'),
                    offset: parseInt(url.searchParams.get('offset') || '0')
                };

                const auditLogs = await auditLogger.searchLogs(filters);
                return NextResponse.json({ success: true, data: auditLogs });

            case 'security_events':
                const eventFilters = {
                    eventType: url.searchParams.get('event_type') || undefined,
                    severity: url.searchParams.get('severity') || undefined,
                    startDate: url.searchParams.get('start_date') || undefined,
                    endDate: url.searchParams.get('end_date') || undefined,
                    limit: parseInt(url.searchParams.get('limit') || '100')
                };

                const securityEvents = await auditLogger.getSecurityEvents(eventFilters);
                return NextResponse.json({ success: true, data: securityEvents });

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error) {
        console.error('Security API error:', error);
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
        const { action, data } = body;

        switch (action) {
            case 'block_ip':
                const { ip, reason } = data;
                if (!ip || !reason) {
                    return NextResponse.json({ error: 'IP and reason required' }, { status: 400 });
                }

                EnhancedRateLimiter.blockIP(ip);

                // Log the admin action
                await auditLogger.logAdminAction(
                    'block_ip',
                    user.id,
                    'ip_address',
                    ip,
                    request,
                    { reason }
                );

                // Store in database
                await supabase.from('blocked_ips').insert({
                    ip_address: ip,
                    reason,
                    blocked_by: user.id
                });

                return NextResponse.json({ success: true, message: 'IP blocked successfully' });

            case 'unblock_ip':
                const { ip: unblockIP } = data;
                if (!unblockIP) {
                    return NextResponse.json({ error: 'IP required' }, { status: 400 });
                }

                EnhancedRateLimiter.unblockIP(unblockIP);

                // Log the admin action
                await auditLogger.logAdminAction(
                    'unblock_ip',
                    user.id,
                    'ip_address',
                    unblockIP,
                    request
                );

                // Update database
                await supabase
                    .from('blocked_ips')
                    .update({ active: false })
                    .eq('ip_address', unblockIP);

                return NextResponse.json({ success: true, message: 'IP unblocked successfully' });

            case 'resolve_alert':
                const { alertId } = data;
                if (!alertId) {
                    return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
                }

                const resolved = securityMonitoring.resolveAlert(alertId);
                if (!resolved) {
                    return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
                }

                // Log the admin action
                await auditLogger.logAdminAction(
                    'resolve_security_alert',
                    user.id,
                    'security_alert',
                    alertId,
                    request
                );

                return NextResponse.json({ success: true, message: 'Alert resolved successfully' });

            case 'create_security_event':
                const { eventType, identifier, details, severity } = data;
                if (!eventType || !identifier) {
                    return NextResponse.json({ error: 'Event type and identifier required' }, { status: 400 });
                }

                await auditLogger.logSecurityEvent(eventType, identifier, details || {}, severity || 'medium');

                return NextResponse.json({ success: true, message: 'Security event logged successfully' });

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error) {
        console.error('Security API POST error:', error);
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
        const { configKey, configValue } = body;

        if (!configKey || !configValue) {
            return NextResponse.json({ error: 'Config key and value required' }, { status: 400 });
        }

        // Update security configuration
        const { error } = await supabase
            .from('security_config')
            .upsert({
                config_key: configKey,
                config_value: configValue,
                updated_by: user.id
            });

        if (error) {
            console.error('Error updating security config:', error);
            return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 });
        }

        // Log the admin action
        await auditLogger.logAdminAction(
            'update_security_config',
            user.id,
            'security_config',
            configKey,
            request,
            { config_value: configValue }
        );

        return NextResponse.json({ success: true, message: 'Security configuration updated successfully' });

    } catch (error) {
        console.error('Security API PUT error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}