-- Row Level Security (RLS) Policies
-- This migration sets up comprehensive RLS policies for multi-tenancy and security

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraped_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS policies
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS UUID AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'sub',
    (auth.jwt() ->> 'sub')::UUID,
    NULL
  )::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users au
    JOIN public.users u ON au.user_id = u.id
    WHERE u.id = auth.user_id()
    AND au.admin_role IN ('admin', 'super_admin')
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_moderator_or_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users au
    JOIN public.users u ON au.user_id = u.id
    WHERE u.id = auth.user_id()
    AND au.admin_role IN ('moderator', 'admin', 'super_admin')
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_subscription_tier() RETURNS TEXT AS $$
  SELECT subscription_tier::TEXT FROM public.users WHERE id = auth.user_id();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (id = auth.user_id());

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (id = auth.user_id());

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (public.is_admin());

-- User profiles policies
CREATE POLICY "Users can view their own profile details" ON public.user_profiles
  FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "Users can update their own profile details" ON public.user_profiles
  FOR UPDATE USING (user_id = auth.user_id());

CREATE POLICY "Users can insert their own profile details" ON public.user_profiles
  FOR INSERT WITH CHECK (user_id = auth.user_id());

CREATE POLICY "Public profiles are viewable by all" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = user_id 
      AND u.profile_data->>'is_public' = 'true'
    )
  );

-- Product categories policies (public read, admin write)
CREATE POLICY "Anyone can view active categories" ON public.product_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.product_categories
  FOR ALL USING (public.is_admin());

-- Products policies
CREATE POLICY "Users can view their own products" ON public.products
  FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "Users can manage their own products" ON public.products
  FOR ALL USING (user_id = auth.user_id());

CREATE POLICY "Anyone can view published products" ON public.products
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT USING (public.is_moderator_or_admin());

CREATE POLICY "Admins can manage all products" ON public.products
  FOR ALL USING (public.is_admin());

-- Scraped products policies (admin and system only)
CREATE POLICY "Admins can view scraped products" ON public.scraped_products
  FOR SELECT USING (public.is_admin());

CREATE POLICY "System can manage scraped products" ON public.scraped_products
  FOR ALL USING (public.is_admin());

-- Market trends policies (public read for subscribers)
CREATE POLICY "Subscribers can view market trends" ON public.market_trends
  FOR SELECT USING (
    public.get_user_subscription_tier() IN ('pro', 'enterprise') OR
    public.is_admin()
  );

CREATE POLICY "Admins can manage market trends" ON public.market_trends
  FOR ALL USING (public.is_admin());

-- Marketplace listings policies
CREATE POLICY "Anyone can view active listings" ON public.marketplace_listings
  FOR SELECT USING (status = 'active');

CREATE POLICY "Sellers can manage their own listings" ON public.marketplace_listings
  FOR ALL USING (seller_id = auth.user_id());

CREATE POLICY "Admins can manage all listings" ON public.marketplace_listings
  FOR ALL USING (public.is_admin());

-- Product bundles policies
CREATE POLICY "Anyone can view active bundles" ON public.product_bundles
  FOR SELECT USING (status = 'active');

CREATE POLICY "Creators can manage their own bundles" ON public.product_bundles
  FOR ALL USING (creator_id = auth.user_id());

CREATE POLICY "Admins can manage all bundles" ON public.product_bundles
  FOR ALL USING (public.is_admin());

-- Bundle items policies
CREATE POLICY "Anyone can view bundle items for active bundles" ON public.bundle_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_bundles pb
      WHERE pb.id = bundle_id AND pb.status = 'active'
    )
  );

CREATE POLICY "Bundle creators can manage bundle items" ON public.bundle_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.product_bundles pb
      WHERE pb.id = bundle_id AND pb.creator_id = auth.user_id()
    )
  );

-- Shopping carts policies
CREATE POLICY "Users can manage their own carts" ON public.shopping_carts
  FOR ALL USING (user_id = auth.user_id());

CREATE POLICY "Guest users can manage session carts" ON public.shopping_carts
  FOR ALL USING (user_id IS NULL AND session_id IS NOT NULL);

-- Cart items policies
CREATE POLICY "Users can manage their cart items" ON public.cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shopping_carts sc
      WHERE sc.id = cart_id AND sc.user_id = auth.user_id()
    )
  );

-- Affiliates policies
CREATE POLICY "Users can view their own affiliate data" ON public.affiliates
  FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "Users can manage their own affiliate data" ON public.affiliates
  FOR ALL USING (user_id = auth.user_id());

CREATE POLICY "Admins can manage all affiliates" ON public.affiliates
  FOR ALL USING (public.is_admin());

-- Sales transactions policies
CREATE POLICY "Users can view their own transactions" ON public.sales_transactions
  FOR SELECT USING (buyer_id = auth.user_id() OR seller_id = auth.user_id());

CREATE POLICY "Affiliates can view their referral transactions" ON public.sales_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.affiliates a
      WHERE a.id = affiliate_id AND a.user_id = auth.user_id()
    )
  );

CREATE POLICY "Admins can view all transactions" ON public.sales_transactions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "System can create transactions" ON public.sales_transactions
  FOR INSERT WITH CHECK (true); -- System/webhook access

-- Affiliate referrals policies
CREATE POLICY "Affiliates can view their own referrals" ON public.affiliate_referrals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.affiliates a
      WHERE a.id = affiliate_id AND a.user_id = auth.user_id()
    )
  );

-- Admin users policies
CREATE POLICY "Admins can view admin users" ON public.admin_users
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Super admins can manage admin users" ON public.admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.user_id() AND au.admin_role = 'super_admin'
    )
  );

-- Audit logs policies
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "System can create audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- System settings policies
CREATE POLICY "Anyone can view public settings" ON public.system_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage all settings" ON public.system_settings
  FOR ALL USING (public.is_admin());

-- Content reports policies
CREATE POLICY "Users can create reports" ON public.content_reports
  FOR INSERT WITH CHECK (reporter_id = auth.user_id());

CREATE POLICY "Users can view their own reports" ON public.content_reports
  FOR SELECT USING (reporter_id = auth.user_id());

CREATE POLICY "Moderators can manage reports" ON public.content_reports
  FOR ALL USING (public.is_moderator_or_admin());

-- Product reviews policies
CREATE POLICY "Anyone can view published reviews" ON public.product_reviews
  FOR SELECT USING (status = 'published');

CREATE POLICY "Users can manage their own reviews" ON public.product_reviews
  FOR ALL USING (user_id = auth.user_id());

CREATE POLICY "Moderators can manage all reviews" ON public.product_reviews
  FOR ALL USING (public.is_moderator_or_admin());

-- Review votes policies
CREATE POLICY "Users can manage their own review votes" ON public.review_votes
  FOR ALL USING (user_id = auth.user_id());

-- User follows policies
CREATE POLICY "Users can manage their own follows" ON public.user_follows
  FOR ALL USING (follower_id = auth.user_id());

CREATE POLICY "Users can view their followers" ON public.user_follows
  FOR SELECT USING (following_id = auth.user_id());

-- Product likes policies
CREATE POLICY "Users can manage their own likes" ON public.product_likes
  FOR ALL USING (user_id = auth.user_id());

CREATE POLICY "Anyone can view like counts" ON public.product_likes
  FOR SELECT USING (true);

-- Affiliate competitions policies
CREATE POLICY "Anyone can view active competitions" ON public.affiliate_competitions
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage competitions" ON public.affiliate_competitions
  FOR ALL USING (public.is_admin());

-- Competition participants policies
CREATE POLICY "Participants can view their own participation" ON public.competition_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.affiliates a
      WHERE a.id = affiliate_id AND a.user_id = auth.user_id()
    )
  );

CREATE POLICY "Anyone can view competition leaderboards" ON public.competition_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.affiliate_competitions ac
      WHERE ac.id = competition_id AND ac.status = 'active'
    )
  );

-- Coupons policies
CREATE POLICY "Anyone can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Creators can manage their own coupons" ON public.coupons
  FOR ALL USING (created_by = auth.user_id());

CREATE POLICY "Admins can manage all coupons" ON public.coupons
  FOR ALL USING (public.is_admin());

-- Coupon usage policies
CREATE POLICY "Users can view their own coupon usage" ON public.coupon_usage
  FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "System can track coupon usage" ON public.coupon_usage
  FOR INSERT WITH CHECK (true);

-- Email campaigns policies (admin only)
CREATE POLICY "Admins can manage email campaigns" ON public.email_campaigns
  FOR ALL USING (public.is_admin());

-- Email recipients policies (admin only)
CREATE POLICY "Admins can manage email recipients" ON public.email_recipients
  FOR ALL USING (public.is_admin());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.user_id());

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- File uploads policies
CREATE POLICY "Users can view their own files" ON public.file_uploads
  FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "Anyone can view public files" ON public.file_uploads
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage their own files" ON public.file_uploads
  FOR ALL USING (user_id = auth.user_id());

-- API keys policies
CREATE POLICY "Users can manage their own API keys" ON public.api_keys
  FOR ALL USING (user_id = auth.user_id());

-- Webhooks policies
CREATE POLICY "Users can manage their own webhooks" ON public.webhooks
  FOR ALL USING (user_id = auth.user_id());

-- Webhook deliveries policies
CREATE POLICY "Users can view their webhook deliveries" ON public.webhook_deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.webhooks w
      WHERE w.id = webhook_id AND w.user_id = auth.user_id()
    )
  );

CREATE POLICY "System can create webhook deliveries" ON public.webhook_deliveries
  FOR INSERT WITH CHECK (true);