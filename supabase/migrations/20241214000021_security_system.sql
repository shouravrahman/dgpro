-- Security System Migration
-- This migration creates tables for comprehensive security monitoring, audit logging, and data protection

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_audit_logs_user_id (user_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_resource_type (resource_type),
    INDEX idx_audit_logs_timestamp (timestamp),
    INDEX idx_audit_logs_severity (severity),
    INDEX idx_audit_logs_ip_address (ip_address)
);

-- Security Events/Logs Table
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    identifier TEXT NOT NULL, -- IP address, user ID, etc.
    details JSONB DEFAULT '{}',
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    
    -- Indexes
    INDEX idx_security_logs_event_type (event_type),
    INDEX idx_security_logs_identifier (identifier),
    INDEX idx_security_logs_severity (severity),
    INDEX idx_security_logs_timestamp (timestamp),
    INDEX idx_security_logs_resolved (resolved)
);

-- Rate Limiting Table (for persistent rate limiting across server restarts)
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier TEXT NOT NULL, -- IP address or user ID
    endpoint_type TEXT NOT NULL, -- 'api', 'auth', 'upload', etc.
    request_count INTEGER DEFAULT 0,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    window_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour',
    blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicates
    UNIQUE(identifier, endpoint_type, window_start),
    
    -- Indexes
    INDEX idx_rate_limits_identifier (identifier),
    INDEX idx_rate_limits_endpoint_type (endpoint_type),
    INDEX idx_rate_limits_window_end (window_end),
    INDEX idx_rate_limits_blocked (blocked)
);

-- Blocked IPs Table
CREATE TABLE IF NOT EXISTS blocked_ips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address INET NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    blocked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    blocked_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- NULL for permanent blocks
    active BOOLEAN DEFAULT true,
    
    -- Indexes
    INDEX idx_blocked_ips_ip_address (ip_address),
    INDEX idx_blocked_ips_active (active),
    INDEX idx_blocked_ips_expires_at (expires_at)
);

-- Security Alerts Table
CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type TEXT NOT NULL CHECK (alert_type IN ('rate_limit', 'suspicious_activity', 'data_breach', 'unauthorized_access', 'malware', 'ddos')),
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_security_alerts_type (alert_type),
    INDEX idx_security_alerts_severity (severity),
    INDEX idx_security_alerts_resolved (resolved),
    INDEX idx_security_alerts_created_at (created_at),
    INDEX idx_security_alerts_user_id (user_id),
    INDEX idx_security_alerts_ip_address (ip_address)
);

-- Encrypted Data Storage Table (for sensitive data that needs encryption at rest)
CREATE TABLE IF NOT EXISTS encrypted_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_type TEXT NOT NULL, -- 'pii', 'payment', 'api_key', etc.
    encrypted_value TEXT NOT NULL,
    encryption_key_id TEXT NOT NULL, -- Reference to key management system
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_encrypted_data_type (data_type),
    INDEX idx_encrypted_data_user_id (user_id),
    INDEX idx_encrypted_data_key_id (encryption_key_id)
);

-- API Keys Table (for secure API key management)
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL UNIQUE, -- Hashed version of the API key
    key_prefix TEXT NOT NULL, -- First few characters for identification
    name TEXT NOT NULL,
    permissions JSONB DEFAULT '{}', -- Permissions for this API key
    last_used_at TIMESTAMPTZ,
    last_used_ip INET,
    expires_at TIMESTAMPTZ,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_api_keys_user_id (user_id),
    INDEX idx_api_keys_hash (key_hash),
    INDEX idx_api_keys_active (active),
    INDEX idx_api_keys_expires_at (expires_at)
);

-- Session Security Table (enhanced session tracking)
CREATE TABLE IF NOT EXISTS secure_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token_hash TEXT NOT NULL UNIQUE,
    ip_address INET NOT NULL,
    user_agent TEXT,
    location_country TEXT,
    location_city TEXT,
    is_suspicious BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    active BOOLEAN DEFAULT true,
    
    -- Indexes
    INDEX idx_secure_sessions_user_id (user_id),
    INDEX idx_secure_sessions_token_hash (session_token_hash),
    INDEX idx_secure_sessions_active (active),
    INDEX idx_secure_sessions_expires_at (expires_at),
    INDEX idx_secure_sessions_suspicious (is_suspicious)
);

-- File Security Scans Table
CREATE TABLE IF NOT EXISTS file_security_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    scan_status TEXT CHECK (scan_status IN ('pending', 'clean', 'infected', 'suspicious', 'error')) DEFAULT 'pending',
    scan_results JSONB DEFAULT '{}',
    quarantined BOOLEAN DEFAULT false,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_file_scans_hash (file_hash),
    INDEX idx_file_scans_status (scan_status),
    INDEX idx_file_scans_user_id (user_id),
    INDEX idx_file_scans_quarantined (quarantined)
);

-- Security Configuration Table
CREATE TABLE IF NOT EXISTS security_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key TEXT NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index
    INDEX idx_security_config_key (config_key)
);

-- Insert default security configurations
INSERT INTO security_config (config_key, config_value, description) VALUES
('rate_limits', '{
    "api": {"windowMs": 60000, "maxRequests": 100},
    "auth": {"windowMs": 900000, "maxRequests": 5},
    "upload": {"windowMs": 60000, "maxRequests": 10},
    "scraping": {"windowMs": 3600000, "maxRequests": 50},
    "ai": {"windowMs": 60000, "maxRequests": 20},
    "admin": {"windowMs": 60000, "maxRequests": 200},
    "public": {"windowMs": 60000, "maxRequests": 1000}
}', 'Rate limiting configurations for different endpoint types'),

('security_headers', '{
    "csp": "default-src ''self''; script-src ''self'' ''unsafe-inline'' https://vercel.live; style-src ''self'' ''unsafe-inline'' https://fonts.googleapis.com; font-src ''self'' https://fonts.gstatic.com; img-src ''self'' data: https:; connect-src ''self'' https://api.vercel.com; frame-ancestors ''none''; base-uri ''self''; form-action ''self''",
    "hsts": "max-age=31536000; includeSubDomains; preload",
    "xFrameOptions": "DENY",
    "xContentTypeOptions": "nosniff",
    "xXSSProtection": "1; mode=block",
    "referrerPolicy": "strict-origin-when-cross-origin"
}', 'Security headers configuration'),

('file_upload_security', '{
    "maxFileSize": 52428800,
    "allowedMimeTypes": ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain", "application/json", "application/zip"],
    "blockedExtensions": [".exe", ".bat", ".cmd", ".scr", ".pif", ".com", ".vbs", ".js"],
    "scanForMalware": true,
    "quarantineThreshold": "suspicious"
}', 'File upload security settings'),

('monitoring_thresholds', '{
    "failedLoginAttempts": 5,
    "failedLoginWindow": 900000,
    "suspiciousActivityThreshold": 10,
    "dataAccessAnomalyThreshold": 1000,
    "ddosDetectionThreshold": 50,
    "ddosDetectionWindow": 10000
}', 'Security monitoring thresholds');

-- Create functions for automatic cleanup
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
    -- Delete audit logs older than 1 year
    DELETE FROM audit_logs 
    WHERE timestamp < NOW() - INTERVAL '1 year';
    
    -- Delete security logs older than 6 months (except critical ones)
    DELETE FROM security_logs 
    WHERE timestamp < NOW() - INTERVAL '6 months' 
    AND severity != 'critical';
    
    -- Delete expired rate limits
    DELETE FROM rate_limits 
    WHERE window_end < NOW() - INTERVAL '1 day';
    
    -- Delete expired blocked IPs
    DELETE FROM blocked_ips 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
    
    -- Delete old file scans (keep for 30 days)
    DELETE FROM file_security_scans 
    WHERE scanned_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_rate_limits_updated_at 
    BEFORE UPDATE ON rate_limits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_encrypted_data_updated_at 
    BEFORE UPDATE ON encrypted_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_config_updated_at 
    BEFORE UPDATE ON security_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all security tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE secure_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_security_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_config ENABLE ROW LEVEL SECURITY;

-- Audit logs: Users can only see their own logs, admins can see all
CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Security logs: Only admins can access
CREATE POLICY "Only admins can access security logs" ON security_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Rate limits: Only system can access (no user access)
CREATE POLICY "System only access for rate limits" ON rate_limits
    FOR ALL USING (false);

-- Blocked IPs: Only admins can access
CREATE POLICY "Only admins can access blocked IPs" ON blocked_ips
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Security alerts: Only admins can access
CREATE POLICY "Only admins can access security alerts" ON security_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Encrypted data: Users can only access their own data
CREATE POLICY "Users can access own encrypted data" ON encrypted_data
    FOR ALL USING (auth.uid() = user_id);

-- API keys: Users can only access their own keys
CREATE POLICY "Users can access own API keys" ON api_keys
    FOR ALL USING (auth.uid() = user_id);

-- Secure sessions: Users can only access their own sessions
CREATE POLICY "Users can access own sessions" ON secure_sessions
    FOR ALL USING (auth.uid() = user_id);

-- File security scans: Users can see their own scans, admins can see all
CREATE POLICY "Users can view own file scans" ON file_security_scans
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Security config: Only admins can access
CREATE POLICY "Only admins can access security config" ON security_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_composite 
    ON audit_logs (user_id, timestamp DESC, severity);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_logs_composite 
    ON security_logs (event_type, severity, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_limits_composite 
    ON rate_limits (identifier, endpoint_type, window_end);

-- Create a view for security dashboard
CREATE OR REPLACE VIEW security_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM audit_logs WHERE timestamp > NOW() - INTERVAL '24 hours') as audit_logs_24h,
    (SELECT COUNT(*) FROM security_logs WHERE timestamp > NOW() - INTERVAL '24 hours' AND severity IN ('high', 'critical')) as critical_events_24h,
    (SELECT COUNT(*) FROM blocked_ips WHERE active = true) as active_blocked_ips,
    (SELECT COUNT(*) FROM security_alerts WHERE resolved = false) as unresolved_alerts,
    (SELECT COUNT(*) FROM rate_limits WHERE blocked = true AND window_end > NOW()) as active_rate_limits,
    (SELECT COUNT(*) FROM file_security_scans WHERE scan_status = 'infected' AND scanned_at > NOW() - INTERVAL '7 days') as infected_files_7d;

-- Grant appropriate permissions
GRANT SELECT ON security_dashboard TO authenticated;

-- Create function to get security metrics (for admins only)
CREATE OR REPLACE FUNCTION get_security_metrics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    SELECT json_build_object(
        'failed_logins_24h', (
            SELECT COUNT(*) FROM audit_logs 
            WHERE action = 'failed_login' 
            AND timestamp > NOW() - INTERVAL '24 hours'
        ),
        'blocked_ips', (
            SELECT COUNT(*) FROM blocked_ips WHERE active = true
        ),
        'rate_limit_violations', (
            SELECT COUNT(*) FROM security_logs 
            WHERE event_type = 'RATE_LIMIT_EXCEEDED' 
            AND timestamp > NOW() - INTERVAL '24 hours'
        ),
        'suspicious_activities', (
            SELECT COUNT(*) FROM security_logs 
            WHERE event_type LIKE '%SUSPICIOUS%' 
            AND timestamp > NOW() - INTERVAL '24 hours'
        ),
        'data_access_anomalies', (
            SELECT COUNT(*) FROM audit_logs 
            WHERE action LIKE 'data_%' 
            AND details->>'records_accessed' IS NOT NULL 
            AND (details->>'records_accessed')::int > 1000
            AND timestamp > NOW() - INTERVAL '24 hours'
        ),
        'active_sessions', (
            SELECT COUNT(*) FROM secure_sessions 
            WHERE active = true AND expires_at > NOW()
        ),
        'last_security_scan', NOW()
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule automatic cleanup (requires pg_cron extension in production)
-- SELECT cron.schedule('cleanup-security-logs', '0 2 * * *', 'SELECT cleanup_old_audit_logs();');

COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all user actions and system events';
COMMENT ON TABLE security_logs IS 'Security-specific events and alerts for monitoring and incident response';
COMMENT ON TABLE rate_limits IS 'Rate limiting data for DDoS protection and abuse prevention';
COMMENT ON TABLE blocked_ips IS 'IP addresses blocked due to suspicious or malicious activity';
COMMENT ON TABLE security_alerts IS 'Security alerts generated by the monitoring system';
COMMENT ON TABLE encrypted_data IS 'Encrypted storage for sensitive data that requires encryption at rest';
COMMENT ON TABLE api_keys IS 'Secure API key management with hashing and permissions';
COMMENT ON TABLE secure_sessions IS 'Enhanced session tracking with security monitoring';
COMMENT ON TABLE file_security_scans IS 'File upload security scanning results and quarantine status';
COMMENT ON TABLE security_config IS 'Security system configuration and settings';