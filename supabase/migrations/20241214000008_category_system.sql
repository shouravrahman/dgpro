-- Category System Migration
-- Adds tables and functions for the product category system

-- Category Usage Tracking Table
CREATE TABLE IF NOT EXISTS category_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id VARCHAR NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  template_id VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Category Statistics Table (for caching computed stats)
CREATE TABLE IF NOT EXISTS category_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id VARCHAR UNIQUE NOT NULL,
  product_count INTEGER DEFAULT 0,
  average_price DECIMAL(10,2) DEFAULT 0,
  popularity_score DECIMAL(3,2) DEFAULT 0,
  trending_score DECIMAL(3,2) DEFAULT 0,
  recent_growth DECIMAL(3,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Category Preferences Table
CREATE TABLE IF NOT EXISTS user_category_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id VARCHAR NOT NULL,
  preference_score DECIMAL(3,2) DEFAULT 0,
  interaction_count INTEGER DEFAULT 0,
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- Template Usage Statistics Table
CREATE TABLE IF NOT EXISTS template_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id VARCHAR NOT NULL,
  template_id VARCHAR NOT NULL,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(3,2) DEFAULT 0,
  average_completion_time INTEGER, -- in minutes
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, template_id)
);

-- AI Agent Performance Table
CREATE TABLE IF NOT EXISTS ai_agent_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR NOT NULL,
  category_id VARCHAR NOT NULL,
  operation VARCHAR NOT NULL,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  average_response_time INTEGER DEFAULT 0, -- in milliseconds
  average_quality_score DECIMAL(3,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, category_id, operation)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_category_usage_category_id ON category_usage(category_id);
CREATE INDEX IF NOT EXISTS idx_category_usage_user_id ON category_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_category_usage_created_at ON category_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_category_stats_category_id ON category_stats(category_id);
CREATE INDEX IF NOT EXISTS idx_user_category_preferences_user_id ON user_category_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_category_preferences_category_id ON user_category_preferences(category_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_stats_category_id ON template_usage_stats(category_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_performance_agent_id ON ai_agent_performance(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_performance_category_id ON ai_agent_performance(category_id);

-- Add category field to products table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category') THEN
    ALTER TABLE products ADD COLUMN category VARCHAR;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'template_id') THEN
    ALTER TABLE products ADD COLUMN template_id VARCHAR;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'form_data') THEN
    ALTER TABLE products ADD COLUMN form_data JSONB;
  END IF;
END $$;

-- Create index on products category field
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_template_id ON products(template_id);

-- Function to update category statistics
CREATE OR REPLACE FUNCTION update_category_stats(p_category_id VARCHAR)
RETURNS VOID AS $$
DECLARE
  v_product_count INTEGER;
  v_average_price DECIMAL(10,2);
  v_recent_growth DECIMAL(3,2);
BEGIN
  -- Calculate product count
  SELECT COUNT(*) INTO v_product_count
  FROM products 
  WHERE category = p_category_id AND status = 'published';
  
  -- Calculate average price
  SELECT COALESCE(AVG((pricing->>'amount')::DECIMAL), 0) INTO v_average_price
  FROM products 
  WHERE category = p_category_id 
    AND status = 'published' 
    AND pricing->>'amount' IS NOT NULL;
  
  -- Calculate recent growth (last 30 days vs previous 30 days)
  WITH recent_count AS (
    SELECT COUNT(*) as count
    FROM products 
    WHERE category = p_category_id 
      AND status = 'published'
      AND created_at >= NOW() - INTERVAL '30 days'
  ),
  previous_count AS (
    SELECT COUNT(*) as count
    FROM products 
    WHERE category = p_category_id 
      AND status = 'published'
      AND created_at >= NOW() - INTERVAL '60 days'
      AND created_at < NOW() - INTERVAL '30 days'
  )
  SELECT 
    CASE 
      WHEN p.count = 0 THEN 
        CASE WHEN r.count > 0 THEN 1.0 ELSE 0.0 END
      ELSE 
        LEAST(((r.count - p.count)::DECIMAL / p.count), 1.0)
    END
  INTO v_recent_growth
  FROM recent_count r, previous_count p;
  
  -- Insert or update category stats
  INSERT INTO category_stats (category_id, product_count, average_price, recent_growth, last_updated)
  VALUES (p_category_id, v_product_count, v_average_price, v_recent_growth, NOW())
  ON CONFLICT (category_id) 
  DO UPDATE SET
    product_count = EXCLUDED.product_count,
    average_price = EXCLUDED.average_price,
    recent_growth = EXCLUDED.recent_growth,
    last_updated = EXCLUDED.last_updated;
END;
$$ LANGUAGE plpgsql;

-- Function to track category usage
CREATE OR REPLACE FUNCTION track_category_usage(
  p_category_id VARCHAR,
  p_user_id UUID,
  p_product_id UUID,
  p_template_id VARCHAR DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insert usage record
  INSERT INTO category_usage (category_id, user_id, product_id, template_id)
  VALUES (p_category_id, p_user_id, p_product_id, p_template_id);
  
  -- Update user preferences
  INSERT INTO user_category_preferences (user_id, category_id, preference_score, interaction_count, last_interaction)
  VALUES (p_user_id, p_category_id, 0.1, 1, NOW())
  ON CONFLICT (user_id, category_id)
  DO UPDATE SET
    preference_score = LEAST(user_category_preferences.preference_score + 0.1, 1.0),
    interaction_count = user_category_preferences.interaction_count + 1,
    last_interaction = NOW();
  
  -- Update template usage stats if template was used
  IF p_template_id IS NOT NULL THEN
    INSERT INTO template_usage_stats (category_id, template_id, usage_count, last_used)
    VALUES (p_category_id, p_template_id, 1, NOW())
    ON CONFLICT (category_id, template_id)
    DO UPDATE SET
      usage_count = template_usage_stats.usage_count + 1,
      last_used = NOW();
  END IF;
  
  -- Update category statistics
  PERFORM update_category_stats(p_category_id);
END;
$$ LANGUAGE plpgsql;

-- Function to get user category recommendations
CREATE OR REPLACE FUNCTION get_user_category_recommendations(p_user_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
  category_id VARCHAR,
  recommendation_score DECIMAL(3,2),
  reason VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  WITH user_preferences AS (
    SELECT 
      ucp.category_id,
      ucp.preference_score,
      ucp.interaction_count
    FROM user_category_preferences ucp
    WHERE ucp.user_id = p_user_id
  ),
  category_popularity AS (
    SELECT 
      cs.category_id,
      cs.popularity_score,
      cs.trending_score,
      cs.product_count
    FROM category_stats cs
  ),
  recommendations AS (
    SELECT 
      cp.category_id,
      COALESCE(
        -- User preference weight (40%)
        (up.preference_score * 0.4) +
        -- Popularity weight (30%)
        (cp.popularity_score * 0.3) +
        -- Trending weight (20%)
        (cp.trending_score * 0.2) +
        -- Activity weight (10%)
        (LEAST(cp.product_count::DECIMAL / 1000, 1.0) * 0.1),
        -- Default for new categories
        (cp.popularity_score * 0.5) + (cp.trending_score * 0.5)
      ) as score,
      CASE 
        WHEN up.category_id IS NOT NULL THEN 'Based on your previous activity'
        WHEN cp.trending_score > 0.8 THEN 'Currently trending'
        WHEN cp.popularity_score > 0.8 THEN 'Popular choice'
        ELSE 'Recommended for you'
      END as reason
    FROM category_popularity cp
    LEFT JOIN user_preferences up ON cp.category_id = up.category_id
    WHERE cp.product_count > 0
  )
  SELECT 
    r.category_id,
    r.score,
    r.reason
  FROM recommendations r
  ORDER BY r.score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to record AI agent performance
CREATE OR REPLACE FUNCTION record_ai_agent_performance(
  p_agent_id VARCHAR,
  p_category_id VARCHAR,
  p_operation VARCHAR,
  p_success BOOLEAN,
  p_response_time INTEGER,
  p_quality_score DECIMAL(3,2) DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO ai_agent_performance (
    agent_id, 
    category_id, 
    operation, 
    success_count, 
    failure_count, 
    average_response_time, 
    average_quality_score,
    last_updated
  )
  VALUES (
    p_agent_id, 
    p_category_id, 
    p_operation, 
    CASE WHEN p_success THEN 1 ELSE 0 END,
    CASE WHEN p_success THEN 0 ELSE 1 END,
    p_response_time,
    COALESCE(p_quality_score, 0),
    NOW()
  )
  ON CONFLICT (agent_id, category_id, operation)
  DO UPDATE SET
    success_count = CASE 
      WHEN p_success THEN ai_agent_performance.success_count + 1 
      ELSE ai_agent_performance.success_count 
    END,
    failure_count = CASE 
      WHEN p_success THEN ai_agent_performance.failure_count 
      ELSE ai_agent_performance.failure_count + 1 
    END,
    average_response_time = (
      (ai_agent_performance.average_response_time * (ai_agent_performance.success_count + ai_agent_performance.failure_count)) + 
      p_response_time
    ) / (ai_agent_performance.success_count + ai_agent_performance.failure_count + 1),
    average_quality_score = CASE 
      WHEN p_quality_score IS NOT NULL THEN
        (ai_agent_performance.average_quality_score * ai_agent_performance.success_count + p_quality_score) / 
        (ai_agent_performance.success_count + 1)
      ELSE ai_agent_performance.average_quality_score
    END,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for category tables
ALTER TABLE category_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_category_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_performance ENABLE ROW LEVEL SECURITY;

-- Category usage policies
CREATE POLICY "Users can view their own category usage" ON category_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own category usage" ON category_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User category preferences policies
CREATE POLICY "Users can manage their own category preferences" ON user_category_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Template usage stats - read-only for users, full access for service role
CREATE POLICY "Users can view template usage stats" ON template_usage_stats
  FOR SELECT USING (true);

-- AI agent performance - read-only for users, full access for service role
CREATE POLICY "Users can view AI agent performance" ON ai_agent_performance
  FOR SELECT USING (true);

-- Category stats - read-only for all
CREATE POLICY "Anyone can view category stats" ON category_stats
  FOR SELECT USING (true);

-- Grant necessary permissions
GRANT SELECT ON category_stats TO authenticated;
GRANT SELECT ON template_usage_stats TO authenticated;
GRANT SELECT ON ai_agent_performance TO authenticated;
GRANT ALL ON category_usage TO authenticated;
GRANT ALL ON user_category_preferences TO authenticated;

-- Insert some initial category stats (these would be updated by the actual system)
INSERT INTO category_stats (category_id, product_count, average_price, popularity_score, trending_score, recent_growth)
VALUES 
  ('design-graphics', 150, 45.00, 0.90, 0.85, 0.15),
  ('software-tools', 89, 125.00, 0.85, 0.90, 0.25),
  ('educational-content', 234, 67.00, 0.80, 0.75, 0.10),
  ('business-templates', 178, 32.00, 0.75, 0.70, 0.05),
  ('media-content', 95, 28.00, 0.80, 0.85, 0.20),
  ('marketing-materials', 156, 38.00, 0.85, 0.80, 0.12),
  ('productivity-tools', 203, 22.00, 0.70, 0.75, 0.08),
  ('creative-assets', 87, 35.00, 0.75, 0.80, 0.18)
ON CONFLICT (category_id) DO NOTHING;