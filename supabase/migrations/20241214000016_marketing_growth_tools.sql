-- Marketing and Growth Tools Migration
-- This migration creates tables for email marketing, landing pages, coupons, and referral programs

-- Email Marketing Tables
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  content TEXT NOT NULL,
  template_id UUID,
  status VARCHAR DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'paused'
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  recipient_count INTEGER DEFAULT 0,
  open_rate DECIMAL DEFAULT 0,
  click_rate DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  thumbnail_url VARCHAR,
  category VARCHAR, -- 'welcome', 'promotional', 'newsletter', 'abandoned_cart'
  is_system BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id), -- Campaign owner
  email VARCHAR NOT NULL,
  name VARCHAR,
  status VARCHAR DEFAULT 'active', -- 'active', 'unsubscribed', 'bounced'
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP,
  UNIQUE(user_id, email)
);

CREATE TABLE email_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES email_subscribers(id) ON DELETE CASCADE,
  status VARCHAR DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced'
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounce_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Landing Page Builder Tables
CREATE TABLE landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  content JSONB NOT NULL, -- Page builder content
  template_id UUID,
  seo_meta JSONB DEFAULT '{}',
  custom_css TEXT,
  custom_js TEXT,
  status VARCHAR DEFAULT 'draft', -- 'draft', 'published', 'archived'
  published_at TIMESTAMP,
  views_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE landing_page_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR,
  content JSONB NOT NULL,
  category VARCHAR, -- 'product', 'service', 'event', 'newsletter'
  is_premium BOOLEAN DEFAULT FALSE,
  is_system BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE landing_page_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id UUID REFERENCES landing_pages(id) ON DELETE CASCADE,
  visitor_id VARCHAR, -- Anonymous visitor tracking
  user_id UUID REFERENCES users(id), -- If logged in
  event_type VARCHAR NOT NULL, -- 'view', 'click', 'conversion', 'form_submit'
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  referrer VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Coupon and Discount Management Tables
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Coupon creator
  code VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR NOT NULL, -- 'percentage', 'fixed_amount', 'free_shipping'
  value DECIMAL NOT NULL,
  minimum_amount DECIMAL DEFAULT 0,
  maximum_discount DECIMAL,
  usage_limit INTEGER, -- NULL for unlimited
  usage_count INTEGER DEFAULT 0,
  user_usage_limit INTEGER DEFAULT 1, -- Per user limit
  applicable_products JSONB DEFAULT '[]', -- Product IDs or categories
  status VARCHAR DEFAULT 'active', -- 'active', 'inactive', 'expired'
  starts_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id VARCHAR, -- Reference to order/transaction
  discount_amount DECIMAL NOT NULL,
  used_at TIMESTAMP DEFAULT NOW()
);

-- Referral Program Tables
CREATE TABLE referral_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Program owner
  name VARCHAR NOT NULL,
  description TEXT,
  reward_type VARCHAR NOT NULL, -- 'percentage', 'fixed_amount', 'credits'
  reward_value DECIMAL NOT NULL,
  referee_reward_type VARCHAR, -- Reward for the person being referred
  referee_reward_value DECIMAL DEFAULT 0,
  minimum_purchase DECIMAL DEFAULT 0,
  maximum_reward DECIMAL,
  status VARCHAR DEFAULT 'active', -- 'active', 'inactive', 'paused'
  terms_conditions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE referral_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES referral_programs(id) ON DELETE CASCADE,
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referral_code VARCHAR UNIQUE NOT NULL,
  clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  total_rewards DECIMAL DEFAULT 0,
  status VARCHAR DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE referral_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_link_id UUID REFERENCES referral_links(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES users(id), -- NULL if not yet registered
  visitor_id VARCHAR, -- Anonymous tracking
  event_type VARCHAR NOT NULL, -- 'click', 'signup', 'purchase'
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES referral_programs(id) ON DELETE CASCADE,
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referral_link_id UUID REFERENCES referral_links(id),
  reward_type VARCHAR NOT NULL,
  reward_amount DECIMAL NOT NULL,
  status VARCHAR DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'cancelled'
  order_id VARCHAR, -- Reference to triggering order
  approved_at TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_email_campaigns_user_id ON email_campaigns(user_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_subscribers_user_id ON email_subscribers(user_id);
CREATE INDEX idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX idx_landing_pages_user_id ON landing_pages(user_id);
CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX idx_landing_pages_status ON landing_pages(status);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_user_id ON coupons(user_id);
CREATE INDEX idx_coupons_status ON coupons(status);
CREATE INDEX idx_referral_links_code ON referral_links(referral_code);
CREATE INDEX idx_referral_links_referrer ON referral_links(referrer_id);
CREATE INDEX idx_referral_tracking_link_id ON referral_tracking(referral_link_id);

-- RLS Policies
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

-- Email Campaigns Policies
CREATE POLICY "Users can manage their own email campaigns" ON email_campaigns
  FOR ALL USING (auth.uid() = user_id);

-- Email Templates Policies
CREATE POLICY "Users can view all email templates" ON email_templates
  FOR SELECT USING (true);
CREATE POLICY "Users can manage their own email templates" ON email_templates
  FOR ALL USING (auth.uid() = created_by OR is_system = true);

-- Email Subscribers Policies
CREATE POLICY "Users can manage their own subscribers" ON email_subscribers
  FOR ALL USING (auth.uid() = user_id);

-- Landing Pages Policies
CREATE POLICY "Users can manage their own landing pages" ON landing_pages
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view published landing pages" ON landing_pages
  FOR SELECT USING (status = 'published');

-- Landing Page Templates Policies
CREATE POLICY "Users can view all landing page templates" ON landing_page_templates
  FOR SELECT USING (true);
CREATE POLICY "Users can manage their own landing page templates" ON landing_page_templates
  FOR ALL USING (auth.uid() = created_by OR is_system = true);

-- Coupons Policies
CREATE POLICY "Users can manage their own coupons" ON coupons
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view active coupons for validation" ON coupons
  FOR SELECT USING (status = 'active' AND (expires_at IS NULL OR expires_at > NOW()));

-- Referral Programs Policies
CREATE POLICY "Users can manage their own referral programs" ON referral_programs
  FOR ALL USING (auth.uid() = user_id);

-- Referral Links Policies
CREATE POLICY "Users can manage their own referral links" ON referral_links
  FOR ALL USING (auth.uid() = referrer_id);

-- Insert default email templates
INSERT INTO email_templates (name, description, content, category, is_system) VALUES
('Welcome Email', 'Welcome new subscribers to your list', '<!DOCTYPE html><html><body><h1>Welcome!</h1><p>Thank you for subscribing to our newsletter.</p></body></html>', 'welcome', true),
('Product Launch', 'Announce new product launches', '<!DOCTYPE html><html><body><h1>New Product Launch!</h1><p>We''re excited to announce our latest product.</p></body></html>', 'promotional', true),
('Newsletter Template', 'Regular newsletter template', '<!DOCTYPE html><html><body><h1>Newsletter</h1><p>Here''s what''s new this week.</p></body></html>', 'newsletter', true);

-- Insert default landing page templates
INSERT INTO landing_page_templates (name, description, content, category, is_system) VALUES
('Product Launch', 'Perfect for launching new products', '{"sections": [{"type": "hero", "title": "Launch Your Product", "subtitle": "Get started today"}]}', 'product', true),
('Newsletter Signup', 'Capture email subscribers', '{"sections": [{"type": "hero", "title": "Join Our Newsletter", "subtitle": "Stay updated with the latest news"}]}', 'newsletter', true),
('Event Registration', 'Promote and register for events', '{"sections": [{"type": "hero", "title": "Register for Our Event", "subtitle": "Don''t miss out on this opportunity"}]}', 'event', true);