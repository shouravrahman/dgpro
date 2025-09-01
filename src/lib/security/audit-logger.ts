import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export interface AuditLogEntry {
    id?: string;
    user_id?: string;
    session_id?: string;
    action: string;
    resource_type: string;
    resource_id?: string;
    ip_address?: string;
    user_agent?: string;
    details?: Record<string, any>;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp?: string;
    success: boolean;
    error_message?: string;
}

export interface SecurityEvent {
    event_type: string;
    identifier: string;
    details: Record<string, any>;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp?: string;
}

export class AuditLogger {
    private static instance: AuditLogger;
    private logQueue: AuditLogEntry[] = [];
    private securityQueue: SecurityEvent[] = [];
    private readonly BATCH_SIZE = 10;
    private readonly FLUSH_INTERVAL = 5000; // 5 seconds

    private constructor() {
        // Flush logs periodically
        setInterval(() => {
            this.flushLogs();
        }, this.FLUSH_INTERVAL);
    }

    public static getInstance(): AuditLogger {
        if (!AuditLogger.instance) {
            AuditLogger.instance = new AuditLogger();
        }
        return AuditLogger.instance;
    }

    /**
     * Log user actions for audit trail
     */
    async logUserAction(
        action: string,
        resourceType: string,
        options: {
            userId?: string;
            resourceId?: string;
            details?: Record<string, any>;
            request?: NextRequest;
            success?: boolean;
            errorMessage?: string;
            severity?: 'low' | 'medium' | 'high' | 'critical';
        } = {}
    ): Promise<void> {
        const entry: AuditLogEntry = {
            action,
            resource_type: resourceType,
            resource_id: options.resourceId,
            user_id: options.userId,
            details: options.details,
            success: options.success ?? true,
            error_message: options.errorMessage,
            severity: options.severity ?? 'low',
            timestamp: new Date().toISOString(),
        };

        if (options.request) {
            entry.ip_address = this.getClientIP(options.request);
            entry.user_agent = options.request.headers.get('user-agent') || undefined;
            entry.session_id = this.getSessionId(options.request);
        }

        this.logQueue.push(entry);

        // Flush immediately for critical events
        if (entry.severity === 'critical') {
            await this.flushLogs();
        }
    }

    /**
     * Log security events
     */
    async logSecurityEvent(
        eventType: string,
        identifier: string,
        details: Record<string, any>,
        severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
    ): Promise<void> {
        const event: SecurityEvent = {
            event_type: eventType,
            identifier,
            details,
            severity,
            timestamp: new Date().toISOString(),
        };

        this.securityQueue.push(event);

        // Flush immediately for high/critical events
        if (severity === 'high' || severity === 'critical') {
            await this.flushSecurityEvents();
        }
    }

    /**
     * Log authentication events
     */
    async logAuthEvent(
        action: 'login' | 'logout' | 'register' | 'password_reset' | 'failed_login',
        userId: string | null,
        request: NextRequest,
        success: boolean,
        details?: Record<string, any>
    ): Promise<void> {
        await this.logUserAction(action, 'authentication', {
            userId: userId || undefined,
            request,
            success,
            details,
            severity: success ? 'low' : 'medium'
        });

        // Also log as security event for failed attempts
        if (!success) {
            await this.logSecurityEvent('AUTH_FAILURE', this.getClientIP(request), {
                action,
                user_id: userId,
                ...details
            }, 'medium');
        }
    }

    /**
     * Log admin actions
     */
    async logAdminAction(
        action: string,
        adminUserId: string,
        targetResourceType: string,
        targetResourceId: string,
        request: NextRequest,
        details?: Record<string, any>
    ): Promise<void> {
        await this.logUserAction(action, targetResourceType, {
            userId: adminUserId,
            resourceId: targetResourceId,
            request,
            details: {
                admin_action: true,
                ...details
            },
            severity: 'high' // Admin actions are always high severity
        });
    }

    /**
     * Log data access events
     */
    async logDataAccess(
        action: 'read' | 'create' | 'update' | 'delete',
        resourceType: string,
        resourceId: string,
        userId: string,
        request?: NextRequest,
        details?: Record<string, any>
    ): Promise<void> {
        const severity = action === 'delete' ? 'high' : 'low';

        await this.logUserAction(`data_${action}`, resourceType, {
            userId,
            resourceId,
            request,
            details,
            severity
        });
    }

    /**
     * Log file operations
     */
    async logFileOperation(
        action: 'upload' | 'download' | 'delete',
        fileName: string,
        userId: string,
        request: NextRequest,
        success: boolean,
        details?: Record<string, any>
    ): Promise<void> {
        await this.logUserAction(`file_${action}`, 'file', {
            userId,
            resourceId: fileName,
            request,
            success,
            details,
            severity: action === 'delete' ? 'medium' : 'low'
        });
    }

    /**
     * Log API usage
     */
    async logAPIUsage(
        endpoint: string,
        method: string,
        userId: string | null,
        request: NextRequest,
        responseStatus: number,
        responseTime?: number,
        details?: Record<string, any>
    ): Promise<void> {
        const success = responseStatus < 400;
        const severity = responseStatus >= 500 ? 'high' : 'low';

        await this.logUserAction('api_call', 'api_endpoint', {
            userId: userId || undefined,
            resourceId: `${method} ${endpoint}`,
            request,
            success,
            details: {
                method,
                endpoint,
                status_code: responseStatus,
                response_time_ms: responseTime,
                ...details
            },
            severity
        });
    }

    /**
     * Flush audit logs to database
     */
    private async flushLogs(): Promise<void> {
        if (this.logQueue.length === 0) return;

        try {
            const supabase = await createClient();
            const logsToFlush = this.logQueue.splice(0, this.BATCH_SIZE);

            const { error } = await supabase
                .from('audit_logs')
                .insert(logsToFlush);

            if (error) {
                console.error('Failed to flush audit logs:', error);
                // Put logs back in queue for retry
                this.logQueue.unshift(...logsToFlush);
            }
        } catch (error) {
            console.error('Error flushing audit logs:', error);
        }
    }

    /**
     * Flush security events to database
     */
    private async flushSecurityEvents(): Promise<void> {
        if (this.securityQueue.length === 0) return;

        try {
            const supabase = await createClient();
            const eventsToFlush = this.securityQueue.splice(0, this.BATCH_SIZE);

            const { error } = await supabase
                .from('security_logs')
                .insert(eventsToFlush);

            if (error) {
                console.error('Failed to flush security events:', error);
                // Put events back in queue for retry
                this.securityQueue.unshift(...eventsToFlush);
            }
        } catch (error) {
            console.error('Error flushing security events:', error);
        }
    }

    /**
     * Get client IP address
     */
    private getClientIP(request: NextRequest): string {
        const forwarded = request.headers.get('x-forwarded-for');
        const realIP = request.headers.get('x-real-ip');
        return forwarded?.split(',')[0] || realIP || request.ip || 'unknown';
    }

    /**
     * Get session ID from request
     */
    private getSessionId(request: NextRequest): string | undefined {
        // Try to get session ID from cookies or headers
        const sessionCookie = request.cookies.get('session')?.value;
        const authHeader = request.headers.get('authorization');

        if (sessionCookie) return sessionCookie;
        if (authHeader) return authHeader.substring(0, 20) + '...'; // Truncated for privacy

        return undefined;
    }

    /**
     * Search audit logs
     */
    async searchLogs(filters: {
        userId?: string;
        action?: string;
        resourceType?: string;
        severity?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
        offset?: number;
    }): Promise<AuditLogEntry[]> {
        try {
            const supabase = await createClient();
            let query = supabase
                .from('audit_logs')
                .select('*')
                .order('timestamp', { ascending: false });

            if (filters.userId) {
                query = query.eq('user_id', filters.userId);
            }
            if (filters.action) {
                query = query.eq('action', filters.action);
            }
            if (filters.resourceType) {
                query = query.eq('resource_type', filters.resourceType);
            }
            if (filters.severity) {
                query = query.eq('severity', filters.severity);
            }
            if (filters.startDate) {
                query = query.gte('timestamp', filters.startDate);
            }
            if (filters.endDate) {
                query = query.lte('timestamp', filters.endDate);
            }

            query = query.limit(filters.limit || 100);
            if (filters.offset) {
                query = query.range(filters.offset, filters.offset + (filters.limit || 100) - 1);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error searching audit logs:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error searching audit logs:', error);
            return [];
        }
    }

    /**
     * Get security events
     */
    async getSecurityEvents(filters: {
        eventType?: string;
        severity?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Promise<SecurityEvent[]> {
        try {
            const supabase = await createClient();
            let query = supabase
                .from('security_logs')
                .select('*')
                .order('timestamp', { ascending: false });

            if (filters.eventType) {
                query = query.eq('event_type', filters.eventType);
            }
            if (filters.severity) {
                query = query.eq('severity', filters.severity);
            }
            if (filters.startDate) {
                query = query.gte('timestamp', filters.startDate);
            }
            if (filters.endDate) {
                query = query.lte('timestamp', filters.endDate);
            }

            query = query.limit(filters.limit || 100);

            const { data, error } = await query;

            if (error) {
                console.error('Error getting security events:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error getting security events:', error);
            return [];
        }
    }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();