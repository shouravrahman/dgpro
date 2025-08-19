-- Market Intelligence System Schema
-- Stores scraped data, trends, and AI-generated insights

-- Market data sources and platforms
CREATE TABLE market_platforms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL, -- 'marketplace', 'ads', 'affiliate', 'social'
  base_url TEXT,
  api_endpoint TEXT,
  scraping_config JSONB DEFAULT '{}',
  rate_limits JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product categories for market intelligence
CREATE TABLE market_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  parent_id UUID REFERENCES market_categories(id),
  description TEXT,
  keywords TEXT[], -- For matching scraped products
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraped market data from various platforms
CREATE TABLE market_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_id UUID REFERENCES market_platforms(id) NOT NULL,
  category_id UUID REFERENCES market_categories(id),
  
  -- Product information
  external_id VARCHAR(255), -- ID from the source platform
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Performance metrics
  sales_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Metadata
  tags TEXT[],
  images TEXT[],
  external_url TEXT,
  seller_info JSONB DEFAULT '{}',
  
  -- AI analysis results
  ai_analysis JSONB DEFAULT '{}',
  trend_score DECIMAL(5,2) DEFAULT 0,
  opportunity_score DECIMAL(5,2) DEFAULT 0,
  competition_level VARCHAR(20), -- 'low', 'medium', 'high'
  
  -- Tracking
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(platform_id, external_id)
);

-- Ad intelligence from Meta Ads Library and other sources
CREATE TABLE ad_intelligence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform VARCHAR(50) NOT NULL, -- 'meta', 'google', 'tiktok', etc.
  
  -- Ad information
  ad_id VARCHAR(255),
  advertiser_name VARCHAR(255),
  ad_creative_url TEXT,
  ad_text TEXT,
  call_to_action VARCHAR(100),
  
  -- Targeting and performance
  target_audience JSONB DEFAULT '{}',
  estimated_reach JSONB DEFAULT '{}',
  ad_spend_estimate JSONB DEFAULT '{}',
  engagement_metrics JSONB DEFAULT '{}',
  
  -- Product/service being advertised
  product_category VARCHAR(100),
  product_keywords TEXT[],
  landing_page_url TEXT,
  
  -- AI analysis
  ai_insights JSONB DEFAULT '{}',
  market_opportunity_score DECIMAL(5,2) DEFAULT 0,
  
  -- Tracking
  ad_start_date DATE,
  ad_end_date DATE,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(platform, ad_id)
);

-- Trend analysis and predictions
CREATE TABLE market_trends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES market_categories(id),
  
  -- Trend information
  trend_name VARCHAR(255) NOT NULL,
  trend_type VARCHAR(50) NOT NULL, -- 'rising', 'declining', 'stable', 'seasonal'
  confidence_score DECIMAL(5,2) NOT NULL,
  
  -- Metrics
  search_volume_change DECIMAL(5,2),
  price_trend DECIMAL(5,2),
  competition_change DECIMAL(5,2),
  demand_score DECIMAL(5,2),
  
  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- AI predictions
  predicted_duration_days INTEGER,
  predicted_peak_date DATE,
  ai_recommendations JSONB DEFAULT '{}',
  
  -- Data sources
  data_sources TEXT[],
  sample_size INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-specific market insights and recommendations
CREATE TABLE user_market_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Personalization based on onboarding
  user_interests TEXT[], -- From onboarding
  experience_level VARCHAR(20), -- From onboarding
  target_revenue INTEGER, -- From onboarding
  
  -- Generated insights
  recommended_categories UUID[] DEFAULT '{}',
  trending_opportunities JSONB DEFAULT '{}',
  competitive_analysis JSONB DEFAULT '{}',
  market_gaps JSONB DEFAULT '{}',
  
  -- Personalized scores
  opportunity_matches JSONB DEFAULT '{}', -- Opportunities matched to user profile
  difficulty_assessments JSONB DEFAULT '{}',
  revenue_predictions JSONB DEFAULT '{}',
  
  -- Tracking
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  insights_version INTEGER DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Scraping jobs and scheduling
CREATE TABLE scraping_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_id UUID REFERENCES market_platforms(id) NOT NULL,
  
  -- Job configuration
  job_type VARCHAR(50) NOT NULL, -- 'full_scrape', 'incremental', 'category_specific'
  target_categories UUID[],
  scraping_config JSONB DEFAULT '{}',
  
  -- Scheduling
  schedule_cron VARCHAR(100), -- Cron expression for scheduling
  priority INTEGER DEFAULT 5, -- 1-10, higher = more priority
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Results
  items_scraped INTEGER DEFAULT 0,
  items_processed INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  error_details JSONB DEFAULT '{}',
  
  -- Next run
  next_run_at TIMESTAMP WITH TIME ZONE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI agent analysis results
CREATE TABLE ai_market_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Analysis target
  target_type VARCHAR(50) NOT NULL, -- 'product', 'trend', 'category', 'user_request'
  target_id UUID, -- References the analyzed item
  user_id UUID REFERENCES auth.users(id), -- For personalized analysis
  
  -- AI agent information
  agent_type VARCHAR(50) NOT NULL, -- 'market_analyzer', 'trend_predictor', 'opportunity_finder'
  model_used VARCHAR(100),
  analysis_version VARCHAR(20),
  
  -- Analysis results
  analysis_results JSONB NOT NULL DEFAULT '{}',
  confidence_score DECIMAL(5,2),
  recommendations JSONB DEFAULT '{}',
  
  -- Performance metrics
  processing_time_ms INTEGER,
  tokens_used INTEGER,
  cost_estimate DECIMAL(8,4),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_market_data_platform_category ON market_data(platform_id, category_id);
CREATE INDEX idx_market_data_trend_score ON market_data(trend_score DESC);
CREATE INDEX idx_market_data_opportunity_score ON market_data(opportunity_score DESC);
CREATE INDEX idx_market_data_last_updated ON market_data(last_updated_at DESC);

CREATE INDEX idx_ad_intelligence_platform ON ad_intelligence(platform);
CREATE INDEX idx_ad_intelligence_category ON ad_intelligence(product_category);
CREATE INDEX idx_ad_intelligence_opportunity_score ON ad_intelligence(market_opportunity_score DESC);

CREATE INDEX idx_market_trends_category ON market_trends(category_id);
CREATE INDEX idx_market_trends_confidence ON market_trends(confidence_score DESC);
CREATE INDEX idx_market_trends_period ON market_trends(period_start, period_end);

CREATE INDEX idx_user_market_insights_user ON user_market_insights(user_id);
CREATE INDEX idx_scraping_jobs_platform ON scraping_jobs(platform_id);
CREATE INDEX idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX idx_scraping_jobs_next_run ON scraping_jobs(next_run_at);

CREATE INDEX idx_ai_market_analysis_target ON ai_market_analysis(target_type, target_id);
CREATE INDEX idx_ai_market_analysis_user ON ai_market_analysis(user_id);
CREATE INDEX idx_ai_market_analysis_agent ON ai_market_analysis(agent_type);

-- Insert initial market platforms
INSERT INTO market_platforms (name, type, base_url, scraping_config) VALUES
('ClickBank', 'affiliate', 'https://www.clickbank.com', '{"rate_limit": 100, "delay_ms": 1000}'),
('Meta Ads Library', 'ads', 'https://www.facebook.com/ads/library', '{"rate_limit": 50, "delay_ms": 2000}'),
('Etsy', 'marketplace', 'https://www.etsy.com', '{"rate_limit": 200, "delay_ms": 500}'),
('Gumroad', 'marketplace', 'https://gumroad.com', '{"rate_limit": 100, "delay_ms": 1000}'),
('Creative Market', 'marketplace', 'https://creativemarket.com', '{"rate_limit": 150, "delay_ms": 800}'),
('Envato Market', 'marketplace', 'https://market.envato.com', '{"rate_limit": 100, "delay_ms": 1200}');

-- Insert initial market categories
INSERT INTO market_categories (name, slug, description, keywords) VALUES
('Digital Art', 'digital-art', 'Digital artwork, illustrations, and graphics', ARRAY['digital art', 'illustration', 'graphics', 'artwork']),
('Templates', 'templates', 'Design templates for various purposes', ARRAY['template', 'design', 'layout', 'mockup']),
('UI/UX Design', 'ui-ux-design', 'User interface and experience design resources', ARRAY['ui', 'ux', 'interface', 'wireframe']),
('Photography', 'photography', 'Stock photos and photography resources', ARRAY['photo', 'photography', 'stock', 'image']),
('Software Tools', 'software-tools', 'Digital tools and software applications', ARRAY['software', 'tool', 'app', 'plugin']),
('Educational Content', 'educational-content', 'Courses, tutorials, and educational materials', ARRAY['course', 'tutorial', 'education', 'learning']),
('Marketing Materials', 'marketing-materials', 'Marketing and promotional content', ARRAY['marketing', 'promotion', 'advertising', 'social media']),
('Business Resources', 'business-resources', 'Business templates and resources', ARRAY['business', 'corporate', 'professional', 'presentation']);

-- RLS Policies
ALTER TABLE market_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_market_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_market_analysis ENABLE ROW LEVEL SECURITY;

-- Public read access for market data (non-sensitive)
CREATE POLICY "Public read access for market platforms" ON market_platforms FOR SELECT USING (true);
CREATE POLICY "Public read access for market categories" ON market_categories FOR SELECT USING (true);
CREATE POLICY "Public read access for market data" ON market_data FOR SELECT USING (true);
CREATE POLICY "Public read access for ad intelligence" ON ad_intelligence FOR SELECT USING (true);
CREATE POLICY "Public read access for market trends" ON market_trends FOR SELECT USING (true);

-- User-specific access for insights
CREATE POLICY "Users can view their own market insights" ON user_market_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own market insights" ON user_market_insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own market insights" ON user_market_insights FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own AI analysis" ON ai_market_analysis FOR SELECT USING (auth.uid() = user_id);

-- Admin access for scraping jobs and data management
CREATE POLICY "Admin access for scraping jobs" ON scraping_jobs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_market_intelligence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_market_platforms_updated_at BEFORE UPDATE ON market_platforms FOR EACH ROW EXECUTE FUNCTION update_market_intelligence_updated_at();
CREATE TRIGGER update_market_categories_updated_at BEFORE UPDATE ON market_categories FOR EACH ROW EXECUTE FUNCTION update_market_intelligence_updated_at();
CREATE TRIGGER update_market_data_updated_at BEFORE UPDATE ON market_data FOR EACH ROW EXECUTE FUNCTION update_market_intelligence_updated_at();
CREATE TRIGGER update_ad_intelligence_updated_at BEFORE UPDATE ON ad_intelligence FOR EACH ROW EXECUTE FUNCTION update_market_intelligence_updated_at();
CREATE TRIGGER update_market_trends_updated_at BEFORE UPDATE ON market_trends FOR EACH ROW EXECUTE FUNCTION update_market_intelligence_updated_at();
CREATE TRIGGER update_user_market_insights_updated_at BEFORE UPDATE ON user_market_insights FOR EACH ROW EXECUTE FUNCTION update_market_intelligence_updated_at();
CREATE TRIGGER update_scraping_jobs_updated_at BEFORE UPDATE ON scraping_jobs FOR EACH ROW EXECUTE FUNCTION update_market_intelligence_updated_at();
CREATE TRIGGER update_ai_market_analysis_updated_at BEFORE UPDATE ON ai_market_analysis FOR EACH ROW EXECUTE FUNCTION update_market_intelligence_updated_at();