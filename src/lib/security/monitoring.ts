import { auditLogger } from './audit-logger';
import { EnhancedRateLimiter } from './rate-limiter';
import { NextRequest } from 'next/server';

export interface SecurityAlert {
    id: string;
    type: 'rate_limit' | 'suspicious_activity' | 'data_breach' | 'unauthorized_access' | 'malware' | 'ddos';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    details: Record<string, any>;
    timestamp: string;
    resolved: boolean;
    user_id?: string;
    ip_address?: string;
}

export interface SecurityMetrics {
    failed_logins_24h: number;
    blocked_ips: number;
    rate_limit_violations: number;
    suspicious_activities: number;
    data_access_anomalies: number;
    active_sessions: number;
    last_security_scan: string;
}

export class SecurityMonitoring {
    private static instance: SecurityMonitoring;
    private alerts: SecurityAlert[] = [];
    private suspiciousIPs = new Set<string>();
    private failedLoginAttempts = new Map<string, { count: number; lastAttempt: number }>();
    private readonly MAX_FAILED_LOGINS = 5;
    private readonly FAILED_LOGIN_WINDOW = 15 * 60 * 1000; // 15 minutes

    private constructor() {
        // Clean up old data periodically
        setInterval(() => {
            this.cleanupOldData();
        }, 60 * 60 * 1000); // Every hour
    }

    public static getInstance(): SecurityMonitoring {
        if (!SecurityMonitoring.instance) {
            SecurityMonitoring.instance = new SecurityMonitoring();
        }
        return SecurityMonitoring.instance;
    }

    /**
     * Monitor authentication attempts
     */
    async monitorAuthAttempt(
        identifier: string,
        success: boolean,
        request: NextRequest,
        userId?: string
    ): Promise<void> {
        const ip = this.getClientIP(request);

        if (!success) {
            // Track failed login attempts
            const key = `${identifier}:${ip}`;
            const now = Date.now();
            const attempts = this.failedLoginAttempts.get(key) || { count: 0, lastAttempt: 0 };

            // Reset count if window expired
            if (now - attempts.lastAttempt > this.FAILED_LOGIN_WINDOW) {
                attempts.count = 0;
            }

            attempts.count++;
            attempts.lastAttempt = now;
            this.failedLoginAttempts.set(key, attempts);

            // Create alert if threshold exceeded
            if (attempts.count >= this.MAX_FAILED_LOGINS) {
                await this.createAlert('suspicious_activity', 'high',
                    `Multiple failed login attempts from ${ip}`, {
                    identifier,
                    ip_address: ip,
                    failed_attempts: attempts.count,
                    time_window: '15 minutes'
                });

                // Mark IP as suspicious
                this.suspiciousIPs.add(ip);

                // Log security event
                await auditLogger.logSecurityEvent('BRUTE_FORCE_ATTEMPT', ip, {
                    identifier,
                    failed_attempts: attempts.count,
                    user_agent: request.headers.get('user-agent')
                }, 'high');
            }
        } else {
            // Clear failed attempts on successful login
            const key = `${identifier}:${ip}`;
            this.failedLoginAttempts.delete(key);
        }
    }

    /**
     * Monitor suspicious user behavior
     */
    async monitorUserBehavior(
        userId: string,
        action: string,
        request: NextRequest,
        details?: Record<string, any>
    ): Promise<void> {
        const ip = this.getClientIP(request);

        // Check for suspicious patterns
        const suspiciousPatterns = [
            'rapid_api_calls',
            'unusual_data_access',
            'privilege_escalation_attempt',
            'bulk_data_download',
            'suspicious_file_upload'
        ];

        if (suspiciousPatterns.some(pattern => action.includes(pattern))) {
            await this.createAlert('suspicious_activity', 'medium',
                `Suspicious user behavior detected: ${action}`, {
                user_id: userId,
                action,
                ip_address: ip,
                ...details
            });
        }

        // Monitor for data access anomalies
        if (action.includes('data_access') && details?.records_accessed) {
            const recordsAccessed = details.records_accessed;
            if (recordsAccessed > 1000) { // Threshold for bulk access
                await this.createAlert('data_breach', 'high',
                    `Potential data breach: User accessed ${recordsAccessed} records`, {
                    user_id: userId,
                    records_accessed: recordsAccessed,
                    ip_address: ip
                });
            }
        }
    }

    /**
     * Monitor file uploads for malware
     */
    async monitorFileUpload(
        fileName: string,
        fileSize: number,
        mimeType: string,
        userId: string,
        request: NextRequest
    ): Promise<boolean> {
        const ip = this.getClientIP(request);

        // Check for suspicious file patterns
        const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
        const suspiciousMimeTypes = [
            'application/x-executable',
            'application/x-msdownload',
            'application/x-msdos-program'
        ];

        const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));

        if (suspiciousExtensions.includes(fileExtension) ||
            suspiciousMimeTypes.includes(mimeType)) {

            await this.createAlert('malware', 'critical',
                `Suspicious file upload detected: ${fileName}`, {
                user_id: userId,
                file_name: fileName,
                file_size: fileSize,
                mime_type: mimeType,
                ip_address: ip
            });

            return false; // Block the upload
        }

        // Check for unusually large files
        const maxFileSize = 100 * 1024 * 1024; // 100MB
        if (fileSize > maxFileSize) {
            await this.createAlert('suspicious_activity', 'medium',
                `Large file upload: ${fileName} (${fileSize} bytes)`, {
                user_id: userId,
                file_name: fileName,
                file_size: fileSize,
                ip_address: ip
            });
        }

        return true; // Allow the upload
    }

    /**
     * Monitor API usage patterns
     */
    async monitorAPIUsage(
        endpoint: string,
        method: string,
        userId: string | null,
        request: NextRequest,
        responseTime: number,
        statusCode: number
    ): Promise<void> {
        const ip = this.getClientIP(request);

        // Monitor for API abuse
        if (responseTime > 10000) { // 10 seconds
            await this.createAlert('suspicious_activity', 'medium',
                `Slow API response detected: ${method} ${endpoint}`, {
                user_id: userId,
                endpoint,
                method,
                response_time: responseTime,
                ip_address: ip
            });
        }

        // Monitor for error patterns
        if (statusCode >= 500) {
            await this.createAlert('suspicious_activity', 'low',
                `Server error on API call: ${method} ${endpoint}`, {
                user_id: userId,
                endpoint,
                method,
                status_code: statusCode,
                ip_address: ip
            });
        }
    }

    /**
     * Check if IP is suspicious
     */
    isSuspiciousIP(ip: string): boolean {
        return this.suspiciousIPs.has(ip);
    }

    /**
     * Create security alert
     */
    private async createAlert(
        type: SecurityAlert['type'],
        severity: SecurityAlert['severity'],
        message: string,
        details: Record<string, any>
    ): Promise<void> {
        const alert: SecurityAlert = {
            id: crypto.randomUUID(),
            type,
            severity,
            message,
            details,
            timestamp: new Date().toISOString(),
            resolved: false,
            user_id: details.user_id,
            ip_address: details.ip_address
        };

        this.alerts.push(alert);

        // Log to audit system
        await auditLogger.logSecurityEvent(`SECURITY_ALERT_${type.toUpperCase()}`,
            details.ip_address || 'unknown', details, severity);

        // Send notifications for critical alerts
        if (severity === 'critical') {
            await this.sendCriticalAlertNotification(alert);
        }
    }

    /**
     * Get security metrics
     */
    async getSecurityMetrics(): Promise<SecurityMetrics> {
        const now = Date.now();
        const last24h = now - (24 * 60 * 60 * 1000);

        // Count failed logins in last 24 hours
        let failedLogins24h = 0;
        for (const [key, attempts] of this.failedLoginAttempts.entries()) {
            if (attempts.lastAttempt > last24h) {
                failedLogins24h += attempts.count;
            }
        }

        // Count recent alerts
        const recentAlerts = this.alerts.filter(alert =>
            new Date(alert.timestamp).getTime() > last24h
        );

        return {
            failed_logins_24h: failedLogins24h,
            blocked_ips: EnhancedRateLimiter.getBlockedIPs().length,
            rate_limit_violations: recentAlerts.filter(a => a.type === 'rate_limit').length,
            suspicious_activities: recentAlerts.filter(a => a.type === 'suspicious_activity').length,
            data_access_anomalies: recentAlerts.filter(a => a.type === 'data_breach').length,
            active_sessions: 0, // Would need to implement session tracking
            last_security_scan: new Date().toISOString()
        };
    }

    /**
     * Get recent alerts
     */
    getRecentAlerts(limit: number = 50): SecurityAlert[] {
        return this.alerts
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    }

    /**
     * Resolve alert
     */
    resolveAlert(alertId: string): boolean {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            return true;
        }
        return false;
    }

    /**
     * Clean up old data
     */
    private cleanupOldData(): void {
        const now = Date.now();
        const cleanupThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days

        // Clean up old failed login attempts
        for (const [key, attempts] of this.failedLoginAttempts.entries()) {
            if (now - attempts.lastAttempt > cleanupThreshold) {
                this.failedLoginAttempts.delete(key);
            }
        }

        // Clean up old alerts
        this.alerts = this.alerts.filter(alert =>
            now - new Date(alert.timestamp).getTime() < cleanupThreshold
        );
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
     * Send critical alert notification
     */
    private async sendCriticalAlertNotification(alert: SecurityAlert): Promise<void> {
        // In a real implementation, this would send notifications via:
        // - Email to security team
        // - Slack/Discord webhook
        // - SMS for critical alerts
        // - Push notifications to admin dashboard

        console.error('CRITICAL SECURITY ALERT:', {
            type: alert.type,
            message: alert.message,
            details: alert.details,
            timestamp: alert.timestamp
        });

        // Log to external monitoring service
        // await this.sendToExternalMonitoring(alert);
    }

    /**
     * Perform security health check
     */
    async performSecurityHealthCheck(): Promise<{
        status: 'healthy' | 'warning' | 'critical';
        issues: string[];
        recommendations: string[];
    }> {
        const issues: string[] = [];
        const recommendations: string[] = [];

        // Check for environment variables
        if (!process.env.ENCRYPTION_KEY) {
            issues.push('Missing ENCRYPTION_KEY environment variable');
            recommendations.push('Set ENCRYPTION_KEY for data encryption');
        }

        if (!process.env.HMAC_SECRET) {
            issues.push('Missing HMAC_SECRET environment variable');
            recommendations.push('Set HMAC_SECRET for data integrity verification');
        }

        // Check for recent critical alerts
        const recentCriticalAlerts = this.alerts.filter(alert =>
            alert.severity === 'critical' &&
            !alert.resolved &&
            new Date(alert.timestamp).getTime() > Date.now() - (24 * 60 * 60 * 1000)
        );

        if (recentCriticalAlerts.length > 0) {
            issues.push(`${recentCriticalAlerts.length} unresolved critical security alerts`);
            recommendations.push('Review and resolve critical security alerts immediately');
        }

        // Check blocked IPs
        const blockedIPs = EnhancedRateLimiter.getBlockedIPs();
        if (blockedIPs.length > 100) {
            issues.push(`High number of blocked IPs: ${blockedIPs.length}`);
            recommendations.push('Review blocked IPs and consider implementing additional DDoS protection');
        }

        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (issues.length > 0) {
            status = recentCriticalAlerts.length > 0 ? 'critical' : 'warning';
        }

        return { status, issues, recommendations };
    }
}

// Export singleton instance
export const securityMonitoring = SecurityMonitoring.getInstance();