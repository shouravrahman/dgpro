-- Admin Panel System Migration
-- This migration creates the comprehensive admin panel infrastructure

-- Admin Users Table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'support')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  action VARCHAR NOT NULL,
  target_type VARCHAR, -- 'user', 'product', 'system', 'marketplace', 'subscription'
  target_id VARCHAR,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- System Settings Table
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR UNIQUE NOT NULL,
  value JSONB,
  category VARCHAR DEFAULT 'general',
  description TEXT,
  updated_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Content Reports Table
CREATE TABLE content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id),
  content_type VARCHAR NOT NULL, -- 'product', 'listing', 'user', 'review', 'forum_post'
  content_id VARCHAR NOT NULL,
  reason VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  priority VARCHAR DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  reviewed_by UUID REFERENCES admin_users(id),
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- System Health Metrics Table
CREATE TABLE system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR NOT NULL,
  metric_value DECIMAL,
  metric_unit VARCHAR,
  status VARCHAR DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical')),
  details JSONB DEFAULT '{}',
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Admin Notifications Table
CREATE TABLE admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  is_read BOOLEAN DEFAULT false,
  action_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Platform Analytics Table
CREATE TABLE platform_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  metric_type VARCHAR NOT NULL, -- 'users', 'products', 'sales', 'revenue', 'ai_usage'
  metric_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bulk Operations Table
CREATE TABLE bulk_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  operation_type VARCHAR NOT NULL, -- 'user_action', 'product_action', 'content_moderation'
  target_ids TEXT[] NOT NULL,
  action VARCHAR NOT NULL,
  parameters JSONB DEFAULT '{}',
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0,
  total_items INTEGER NOT NULL,
  results JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_target_type ON audit_logs(target_type);
CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_content_reports_content_type ON content_reports(content_type);
CREATE INDEX idx_system_health_metrics_recorded_at ON system_health_metrics(recorded_at);
CREATE INDEX idx_system_health_metrics_status ON system_health_metrics(status);
CREATE INDEX idx_admin_notifications_admin_id ON admin_notifications(admin_id);
CREATE INDEX idx_admin_notifications_is_read ON admin_notifications(is_read);
CREATE INDEX idx_platform_analytics_date ON platform_analytics(date);
CREATE INDEX idx_platform_analytics_metric_type ON platform_analytics(metric_type);
CREATE INDEX idx_bulk_operations_admin_id ON bulk_operations(admin_id);
CREATE INDEX idx_bulk_operations_status ON bulk_operations(status);

-- Row Level Security Policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_operations ENABLE ROW LEVEL SECURITY;

-- Admin Users Policies
CREATE POLICY "Admin users can view admin users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

CREATE POLICY "Super admins can manage admin users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role = 'super_admin' 
      AND au.is_active = true
    )
  );

-- Audit Logs Policies
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

-- System Settings Policies
CREATE POLICY "Admins can view system settings" ON system_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can manage system settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role IN ('super_admin', 'admin') 
      AND au.is_active = true
    )
  );

-- Content Reports Policies
CREATE POLICY "Admins can view content reports" ON content_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

CREATE POLICY "Users can create content reports" ON content_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can update content reports" ON content_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

-- System Health Metrics Policies
CREATE POLICY "Admins can view system health metrics" ON system_health_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

-- Admin Notifications Policies
CREATE POLICY "Admins can view their notifications" ON admin_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.id = admin_notifications.admin_id
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can update their notifications" ON admin_notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.id = admin_notifications.admin_id
      AND au.is_active = true
    )
  );

-- Platform Analytics Policies
CREATE POLICY "Admins can view platform analytics" ON platform_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

-- Bulk Operations Policies
CREATE POLICY "Admins can view bulk operations" ON bulk_operations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can create bulk operations" ON bulk_operations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.id = admin_id
      AND au.is_active = true
    )
  );

-- Functions for admin operations
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'active_users', (SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at > NOW() - INTERVAL '30 days'),
    'total_products', (SELECT COUNT(*) FROM products),
    'published_products', (SELECT COUNT(*) FROM products WHERE status = 'published'),
    'total_sales', (SELECT COUNT(*) FROM sales_transactions WHERE payment_status = 'completed'),
    'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM sales_transactions WHERE payment_status = 'completed'),
    'pending_reports', (SELECT COUNT(*) FROM content_reports WHERE status = 'pending'),
    'system_health', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'metric', metric_name,
          'value', metric_value,
          'status', status
        )
      )
      FROM system_health_metrics 
      WHERE recorded_at > NOW() - INTERVAL '1 hour'
      ORDER BY recorded_at DESC
      LIMIT 10
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action VARCHAR,
  p_target_type VARCHAR DEFAULT NULL,
  p_target_id VARCHAR DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (admin_id, action, target_type, target_id, details)
  VALUES (p_admin_id, p_action, p_target_type, p_target_id, p_details)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update system health
CREATE OR REPLACE FUNCTION update_system_health(
  p_metric_name VARCHAR,
  p_metric_value DECIMAL,
  p_metric_unit VARCHAR DEFAULT NULL,
  p_status VARCHAR DEFAULT 'normal',
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO system_health_metrics (metric_name, metric_value, metric_unit, status, details)
  VALUES (p_metric_name, p_metric_value, p_metric_unit, p_status, p_details)
  RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default system settings
INSERT INTO system_settings (key, value, category, description) VALUES
('platform_name', '"AI Product Creator"', 'general', 'Platform display name'),
('maintenance_mode', 'false', 'system', 'Enable/disable maintenance mode'),
('max_file_upload_size', '10485760', 'limits', 'Maximum file upload size in bytes (10MB)'),
('ai_rate_limit_per_hour', '100', 'limits', 'AI operations per hour per user'),
('marketplace_commission_rate', '0.30', 'marketplace', 'Platform commission rate (30%)'),
('affiliate_commission_rate', '0.10', 'affiliate', 'Affiliate commission rate (10%)'),
('email_notifications_enabled', 'true', 'notifications', 'Enable email notifications'),
('auto_moderation_enabled', 'true', 'moderation', 'Enable automatic content moderation');

-- Insert sample system health metrics
INSERT INTO system_health_metrics (metric_name, metric_value, metric_unit, status) VALUES
('cpu_usage', 45.2, 'percent', 'normal'),
('memory_usage', 67.8, 'percent', 'normal'),
('disk_usage', 23.1, 'percent', 'normal'),
('api_response_time', 120.5, 'ms', 'normal'),
('database_connections', 15, 'count', 'normal');