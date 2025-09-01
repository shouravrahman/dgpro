-- Subscription Intelligence System Migration

-- Create subscription_intelligence table for storing AI-generated insights
CREATE TABLE IF NOT EXISTS subscription_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  intelligence_data JSONB NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '1 hour'),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create usage_analytics table for detailed usage tracking
CREATE TABLE IF NOT EXISTS usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  feature_name VARCHAR NOT NULL,
  usage_count INTEGER DEFAULT 0,
  usage_duration INTEGER DEFAULT 0, -- in seconds
  session_id VARCHAR,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create churn_predictions table for storing churn risk assessments
CREATE TABLE IF NOT EXISTS churn_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level VARCHAR NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  factors JSONB NOT NULL,
  retention_actions JSONB,
  confidence_score INTEGER DEFAULT 85,
  time_to_churn INTEGER, -- days
  predicted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create personalized_offers table for storing AI-generated offers
CREATE TABLE IF NOT EXISTS personalized_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  offer_type VARCHAR NOT NULL CHECK (offer_type IN ('discount', 'trial_extension', 'feature_unlock', 'bonus_credits')),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  value DECIMAL NOT NULL,
  original_price DECIMAL,
  discounted_price DECIMAL,
  discount_percentage INTEGER,
  conditions JSONB,
  target_segment VARCHAR,
  priority VARCHAR DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  estimated_conversion INTEGER DEFAULT 0,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'declined', 'expired')),
  valid_until TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create subscription_recommendations table
CREATE TABLE IF NOT EXISTS subscription_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recommendation_type VARCHAR NOT NULL CHECK (recommendation_type IN ('upgrade', 'downgrade', 'maintain', 'pause')),
  target_tier VARCHAR CHECK (target_tier IN ('free', 'pro')),
  target_interval VARCHAR CHECK (target_interval IN ('monthly', 'yearly')),
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  reasoning JSONB NOT NULL,
  potential_savings DECIMAL,
  potential_value DECIMAL,
  urgency VARCHAR DEFAULT 'low' CHECK (urgency IN ('low', 'medium', 'high')),
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed')),
  valid_until TIMESTAMP NOT NULL,
  applied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create usage_optimization_suggestions table
CREATE TABLE IF NOT EXISTS usage_optimization_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  suggestion_type VARCHAR NOT NULL CHECK (suggestion_type IN ('usage', 'billing', 'features', 'workflow')),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  impact VARCHAR NOT NULL CHECK (impact IN ('cost_saving', 'efficiency', 'feature_discovery', 'limit_optimization')),
  potential_savings DECIMAL,
  potential_value DECIMAL,
  difficulty VARCHAR DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  estimated_time VARCHAR,
  steps JSONB,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed')),
  priority INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create dynamic_pricing table for personalized pricing
CREATE TABLE IF NOT EXISTS dynamic_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  base_price DECIMAL NOT NULL,
  adjusted_price DECIMAL NOT NULL,
  adjustment_factor DECIMAL NOT NULL DEFAULT 1.0,
  pricing_factors JSONB NOT NULL,
  user_segment VARCHAR NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_segments table for storing user segmentation data
CREATE TABLE IF NOT EXISTS user_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  segment_type VARCHAR NOT NULL CHECK (segment_type IN ('new_user', 'power_user', 'casual_user', 'at_risk', 'high_value', 'price_sensitive')),
  characteristics JSONB,
  typical_behavior JSONB,
  recommended_strategy TEXT,
  confidence_score INTEGER DEFAULT 85,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create usage_alerts table for proactive notifications
CREATE TABLE IF NOT EXISTS usage_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  alert_type VARCHAR NOT NULL CHECK (alert_type IN ('approaching_limit', 'unusual_spike', 'cost_increase', 'optimization_opportunity')),
  severity VARCHAR DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  threshold_value DECIMAL,
  current_value DECIMAL,
  suggested_actions JSONB,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_intelligence_user_id ON subscription_intelligence(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_intelligence_expires_at ON subscription_intelligence(expires_at);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_id_date ON usage_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_feature_name ON usage_analytics(feature_name);
CREATE INDEX IF NOT EXISTS idx_churn_predictions_user_id ON churn_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_churn_predictions_risk_level ON churn_predictions(risk_level);
CREATE INDEX IF NOT EXISTS idx_personalized_offers_user_id ON personalized_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_personalized_offers_status ON personalized_offers(status);
CREATE INDEX IF NOT EXISTS idx_personalized_offers_valid_until ON personalized_offers(valid_until);
CREATE INDEX IF NOT EXISTS idx_subscription_recommendations_user_id ON subscription_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_recommendations_status ON subscription_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_usage_optimization_suggestions_user_id ON usage_optimization_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_user_id ON dynamic_pricing(user_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_valid_until ON dynamic_pricing(valid_until);
CREATE INDEX IF NOT EXISTS idx_user_segments_user_id ON user_segments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_segments_segment_type ON user_segments(segment_type);
CREATE INDEX IF NOT EXISTS idx_usage_alerts_user_id ON usage_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_alerts_status ON usage_alerts(status);

-- Enable RLS on all tables
ALTER TABLE subscription_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE churn_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_optimization_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscription_intelligence
CREATE POLICY "Users can view their own intelligence data" ON subscription_intelligence
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert intelligence data" ON subscription_intelligence
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update intelligence data" ON subscription_intelligence
  FOR UPDATE USING (true);

-- Create RLS policies for usage_analytics
CREATE POLICY "Users can view their own usage analytics" ON usage_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage analytics" ON usage_analytics
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for churn_predictions
CREATE POLICY "Users can view their own churn predictions" ON churn_predictions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage churn predictions" ON churn_predictions
  FOR ALL USING (true);

-- Create RLS policies for personalized_offers
CREATE POLICY "Users can view their own offers" ON personalized_offers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own offers" ON personalized_offers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can manage offers" ON personalized_offers
  FOR ALL USING (true);

-- Create RLS policies for subscription_recommendations
CREATE POLICY "Users can view their own recommendations" ON subscription_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations" ON subscription_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can manage recommendations" ON subscription_recommendations
  FOR ALL USING (true);

-- Create RLS policies for usage_optimization_suggestions
CREATE POLICY "Users can view their own optimization suggestions" ON usage_optimization_suggestions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestions" ON usage_optimization_suggestions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can manage suggestions" ON usage_optimization_suggestions
  FOR ALL USING (true);

-- Create RLS policies for dynamic_pricing
CREATE POLICY "Users can view their own pricing" ON dynamic_pricing
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage pricing" ON dynamic_pricing
  FOR ALL USING (true);

-- Create RLS policies for user_segments
CREATE POLICY "Users can view their own segment data" ON user_segments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage segments" ON user_segments
  FOR ALL USING (true);

-- Create RLS policies for usage_alerts
CREATE POLICY "Users can view their own alerts" ON usage_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" ON usage_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can manage alerts" ON usage_alerts
  FOR ALL USING (true);

-- Create function to track feature usage
CREATE OR REPLACE FUNCTION track_feature_usage(
  user_uuid UUID,
  feature VARCHAR,
  duration INTEGER DEFAULT 0,
  session_uuid VARCHAR DEFAULT NULL,
  usage_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_analytics (user_id, date, feature_name, usage_count, usage_duration, session_id, metadata)
  VALUES (user_uuid, CURRENT_DATE, feature, 1, duration, session_uuid, usage_metadata)
  ON CONFLICT (user_id, date, feature_name) 
  DO UPDATE SET 
    usage_count = usage_analytics.usage_count + 1,
    usage_duration = usage_analytics.usage_duration + duration,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up expired data
CREATE OR REPLACE FUNCTION cleanup_expired_intelligence_data()
RETURNS VOID AS $$
BEGIN
  -- Clean up expired subscription intelligence
  DELETE FROM subscription_intelligence WHERE expires_at < NOW();
  
  -- Clean up expired churn predictions
  DELETE FROM churn_predictions WHERE expires_at < NOW();
  
  -- Clean up expired offers
  UPDATE personalized_offers 
  SET status = 'expired' 
  WHERE valid_until < NOW() AND status = 'active';
  
  -- Clean up expired recommendations
  UPDATE subscription_recommendations 
  SET status = 'dismissed' 
  WHERE valid_until < NOW() AND status = 'pending';
  
  -- Clean up expired dynamic pricing
  DELETE FROM dynamic_pricing WHERE valid_until < NOW() AND applied = FALSE;
  
  -- Clean up old usage analytics (keep 1 year)
  DELETE FROM usage_analytics WHERE date < (CURRENT_DATE - INTERVAL '1 year');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate user segment
CREATE OR REPLACE FUNCTION calculate_user_segment(user_uuid UUID)
RETURNS VARCHAR AS $$
DECLARE
  account_age INTEGER;
  usage_score INTEGER;
  engagement_score INTEGER;
  segment VARCHAR;
BEGIN
  -- Calculate account age in days
  SELECT EXTRACT(DAY FROM (NOW() - created_at)) INTO account_age
  FROM users WHERE id = user_uuid;
  
  -- Calculate usage score (0-100)
  SELECT COALESCE(
    (usage_ai_requests * 5) + 
    (usage_products * 10) + 
    (usage_marketplace_listings * 15) + 
    (usage_file_uploads * 2), 0
  ) INTO usage_score
  FROM users WHERE id = user_uuid;
  
  -- Calculate engagement score based on recent activity
  SELECT COALESCE(COUNT(*) * 10, 0) INTO engagement_score
  FROM usage_analytics 
  WHERE user_id = user_uuid 
    AND date >= (CURRENT_DATE - INTERVAL '7 days');
  
  -- Determine segment
  IF account_age < 30 THEN
    segment := 'new_user';
  ELSIF usage_score > 100 OR engagement_score > 50 THEN
    segment := 'power_user';
  ELSIF usage_score < 20 AND engagement_score < 10 THEN
    segment := 'at_risk';
  ELSIF usage_score > 50 THEN
    segment := 'high_value';
  ELSE
    segment := 'casual_user';
  END IF;
  
  -- Update or insert user segment
  INSERT INTO user_segments (user_id, segment_type, last_updated)
  VALUES (user_uuid, segment, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    segment_type = segment,
    last_updated = NOW();
  
  RETURN segment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update user segment on usage changes
CREATE OR REPLACE FUNCTION update_user_segment_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_user_segment(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_segment
  AFTER INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_segment_trigger();

-- Create function to generate usage alerts
CREATE OR REPLACE FUNCTION generate_usage_alerts(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  user_tier VARCHAR;
  ai_usage INTEGER;
  ai_limit INTEGER;
  products_usage INTEGER;
  products_limit INTEGER;
BEGIN
  -- Get user's current tier and usage
  SELECT subscription_tier, usage_ai_requests, usage_products
  INTO user_tier, ai_usage, products_usage
  FROM users WHERE id = user_uuid;
  
  -- Set limits based on tier
  IF user_tier = 'pro' THEN
    ai_limit := -1; -- Unlimited
    products_limit := -1; -- Unlimited
  ELSE
    ai_limit := 10;
    products_limit := 3;
  END IF;
  
  -- Check AI requests limit
  IF ai_limit > 0 AND ai_usage >= (ai_limit * 0.8) THEN
    INSERT INTO usage_alerts (user_id, alert_type, severity, title, message, threshold_value, current_value, suggested_actions)
    VALUES (
      user_uuid,
      'approaching_limit',
      CASE WHEN ai_usage >= (ai_limit * 0.95) THEN 'critical' ELSE 'warning' END,
      'AI Requests Limit Approaching',
      'You have used ' || ai_usage || ' of ' || ai_limit || ' AI requests this month.',
      ai_limit,
      ai_usage,
      '["Consider upgrading to Pro for unlimited requests", "Optimize your request usage", "Monitor usage more closely"]'::jsonb
    )
    ON CONFLICT (user_id, alert_type, title) DO NOTHING;
  END IF;
  
  -- Check products limit
  IF products_limit > 0 AND products_usage >= (products_limit * 0.8) THEN
    INSERT INTO usage_alerts (user_id, alert_type, severity, title, message, threshold_value, current_value, suggested_actions)
    VALUES (
      user_uuid,
      'approaching_limit',
      CASE WHEN products_usage >= (products_limit * 0.95) THEN 'critical' ELSE 'warning' END,
      'Products Limit Approaching',
      'You have created ' || products_usage || ' of ' || products_limit || ' products this month.',
      products_limit,
      products_usage,
      '["Upgrade to Pro for unlimited products", "Archive unused products", "Consider your product strategy"]'::jsonb
    )
    ON CONFLICT (user_id, alert_type, title) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;