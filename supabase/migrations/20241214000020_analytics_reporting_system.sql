-- Analytics and Reporting System Migration
-- This migration creates tables for storing custom reports and analytics data

-- Custom Reports table
CREATE TABLE IF NOT EXISTS custom_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    metrics JSONB NOT NULL DEFAULT '[]',
    dimensions JSONB NOT NULL DEFAULT '[]',
    filters JSONB NOT NULL DEFAULT '{}',
    schedule JSONB,
    format VARCHAR(10) NOT NULL CHECK (format IN ('csv', 'json', 'pdf')),
    recipients JSONB NOT NULL DEFAULT '[]',
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Events table (for custom event tracking)
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    properties JSONB DEFAULT '{}',
    page_path VARCHAR(500),
    referrer VARCHAR(500),
    user_agent TEXT,
    ip_address INET,
    country VARCHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page Views table
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    page_path VARCHAR(500) NOT NULL,
    page_title VARCHAR(500),
    referrer VARCHAR(500),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    duration INTEGER DEFAULT 0, -- in seconds
    bounce BOOLEAN DEFAULT FALSE,
    exit_page BOOLEAN DEFAULT FALSE,
    user_agent TEXT,
    ip_address INET,
    country VARCHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER DEFAULT 0, -- in seconds
    page_views INTEGER DEFAULT 0,
    events INTEGER DEFAULT 0,
    bounce BOOLEAN DEFAULT FALSE,
    conversion BOOLEAN DEFAULT FALSE,
    conversion_value DECIMAL(10,2) DEFAULT 0,
    referrer VARCHAR(500),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    entry_page VARCHAR(500),
    exit_page VARCHAR(500),
    user_agent TEXT,
    ip_address INET,
    country VARCHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversion Events table
CREATE TABLE IF NOT EXISTS conversion_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    conversion_type VARCHAR(100) NOT NULL,
    conversion_value DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    order_id UUID,
    funnel_step VARCHAR(100),
    source VARCHAR(100),
    medium VARCHAR(100),
    campaign VARCHAR(100),
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path VARCHAR(500) NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'page_load_time', 'first_contentful_paint', etc.
    metric_value DECIMAL(10,3) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A/B Test Results table
CREATE TABLE IF NOT EXISTS ab_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_name VARCHAR(255) NOT NULL,
    variant VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    converted BOOLEAN DEFAULT FALSE,
    conversion_value DECIMAL(10,2) DEFAULT 0,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue Analytics View
CREATE OR REPLACE VIEW revenue_analytics AS
SELECT 
    DATE_TRUNC('day', st.created_at) as date,
    COUNT(*) as transactions,
    SUM(st.amount) as total_revenue,
    AVG(st.amount) as avg_order_value,
    COUNT(DISTINCT st.user_id) as unique_customers,
    SUM(CASE WHEN st.subscription_id IS NOT NULL THEN st.amount ELSE 0 END) as recurring_revenue,
    COUNT(CASE WHEN st.subscription_id IS NOT NULL THEN 1 END) as subscription_transactions
FROM sales_transactions st
WHERE st.payment_status = 'completed'
GROUP BY DATE_TRUNC('day', st.created_at)
ORDER BY date DESC;

-- User Behavior Analytics View
CREATE OR REPLACE VIEW user_behavior_analytics AS
SELECT 
    DATE_TRUNC('day', us.created_at) as date,
    COUNT(*) as total_sessions,
    AVG(us.duration) as avg_session_duration,
    AVG(us.page_views) as avg_page_views,
    SUM(CASE WHEN us.bounce THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as bounce_rate,
    SUM(CASE WHEN us.conversion THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as conversion_rate,
    COUNT(DISTINCT us.user_id) as unique_users
FROM user_sessions us
GROUP BY DATE_TRUNC('day', us.created_at)
ORDER BY date DESC;

-- Top Pages View
CREATE OR REPLACE VIEW top_pages_analytics AS
SELECT 
    pv.page_path,
    COUNT(*) as total_views,
    COUNT(DISTINCT pv.user_id) as unique_views,
    AVG(pv.duration) as avg_duration,
    SUM(CASE WHEN pv.bounce THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as bounce_rate,
    SUM(CASE WHEN pv.exit_page THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as exit_rate
FROM page_views pv
WHERE pv.created_at >= NOW() - INTERVAL '30 days'
GROUP BY pv.page_path
ORDER BY total_views DESC;

-- Conversion Funnel View
CREATE OR REPLACE VIEW conversion_funnel_analytics AS
SELECT 
    ce.conversion_type,
    ce.funnel_step,
    COUNT(*) as conversions,
    COUNT(DISTINCT ce.user_id) as unique_users,
    SUM(ce.conversion_value) as total_value,
    AVG(ce.conversion_value) as avg_value
FROM conversion_events ce
WHERE ce.created_at >= NOW() - INTERVAL '30 days'
GROUP BY ce.conversion_type, ce.funnel_step
ORDER BY ce.conversion_type, ce.funnel_step;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);

CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at);
CREATE INDEX IF NOT EXISTS idx_conversion_events_user_id ON conversion_events(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_type ON conversion_events(conversion_type);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_page_path ON performance_metrics(page_path);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);

-- Enable Row Level Security
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_reports
CREATE POLICY "Users can view their own reports" ON custom_reports
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create their own reports" ON custom_reports
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own reports" ON custom_reports
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own reports" ON custom_reports
    FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for analytics_events (admin only)
CREATE POLICY "Admins can view all analytics events" ON analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

CREATE POLICY "System can insert analytics events" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- RLS Policies for page_views (admin only)
CREATE POLICY "Admins can view all page views" ON page_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

CREATE POLICY "System can insert page views" ON page_views
    FOR INSERT WITH CHECK (true);

-- RLS Policies for user_sessions (admin only)
CREATE POLICY "Admins can view all user sessions" ON user_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

CREATE POLICY "System can manage user sessions" ON user_sessions
    FOR ALL WITH CHECK (true);

-- RLS Policies for conversion_events (admin only)
CREATE POLICY "Admins can view all conversion events" ON conversion_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

CREATE POLICY "System can insert conversion events" ON conversion_events
    FOR INSERT WITH CHECK (true);

-- RLS Policies for performance_metrics (admin only)
CREATE POLICY "Admins can view all performance metrics" ON performance_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

CREATE POLICY "System can insert performance metrics" ON performance_metrics
    FOR INSERT WITH CHECK (true);

-- RLS Policies for ab_test_results (admin only)
CREATE POLICY "Admins can view all A/B test results" ON ab_test_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

CREATE POLICY "System can insert A/B test results" ON ab_test_results
    FOR INSERT WITH CHECK (true);

-- Function to update session end time and duration
CREATE OR REPLACE FUNCTION update_session_end()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        NEW.duration = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update session duration
CREATE TRIGGER update_session_duration
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_session_end();

-- Function to calculate bounce rate
CREATE OR REPLACE FUNCTION calculate_bounce_rate(session_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    page_count INTEGER;
    session_duration INTEGER;
BEGIN
    -- Get page view count for this session
    SELECT COUNT(*) INTO page_count
    FROM page_views
    WHERE session_id = session_uuid::TEXT;
    
    -- Get session duration
    SELECT duration INTO session_duration
    FROM user_sessions
    WHERE session_id = session_uuid::TEXT;
    
    -- Consider it a bounce if only 1 page view or session < 30 seconds
    RETURN (page_count <= 1 OR session_duration < 30);
END;
$$ LANGUAGE plpgsql;

-- Creator Goals table
CREATE TABLE IF NOT EXISTS creator_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('revenue', 'sales', 'followers', 'products')),
    target DECIMAL(12,2) NOT NULL,
    current DECIMAL(12,2) DEFAULT 0,
    deadline DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for creator goals
CREATE INDEX IF NOT EXISTS idx_creator_goals_creator_id ON creator_goals(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_goals_status ON creator_goals(status);
CREATE INDEX IF NOT EXISTS idx_creator_goals_type ON creator_goals(type);

-- Enable Row Level Security for creator goals
ALTER TABLE creator_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creator_goals
CREATE POLICY "Creators can view their own goals" ON creator_goals
    FOR SELECT USING (creator_id = auth.uid());

CREATE POLICY "Creators can create their own goals" ON creator_goals
    FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update their own goals" ON creator_goals
    FOR UPDATE USING (creator_id = auth.uid());

CREATE POLICY "Creators can delete their own goals" ON creator_goals
    FOR DELETE USING (creator_id = auth.uid());

-- Admins can view all creator goals
CREATE POLICY "Admins can view all creator goals" ON creator_goals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- Function to update goal progress
CREATE OR REPLACE FUNCTION update_creator_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Auto-complete goal if target is reached
    IF NEW.current >= NEW.target AND NEW.status = 'active' THEN
        NEW.status = 'completed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update goal progress
CREATE TRIGGER update_goal_progress
    BEFORE UPDATE ON creator_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_creator_goal_progress();

-- Add some sample data for testing (optional)
-- This would typically be populated by real user interactions

COMMENT ON TABLE custom_reports IS 'Stores custom analytics reports created by users';
COMMENT ON TABLE creator_goals IS 'Stores creator goals and progress tracking';
COMMENT ON TABLE analytics_events IS 'Stores custom analytics events tracked throughout the platform';
COMMENT ON TABLE page_views IS 'Stores page view data for analytics';
COMMENT ON TABLE user_sessions IS 'Stores user session data for behavior analytics';
COMMENT ON TABLE conversion_events IS 'Stores conversion events for funnel analysis';
COMMENT ON TABLE performance_metrics IS 'Stores performance metrics like page load times';
COMMENT ON TABLE ab_test_results IS 'Stores A/B test participation and results';