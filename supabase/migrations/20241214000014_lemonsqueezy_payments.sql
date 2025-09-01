-- LemonSqueezy Payment Integration Migration

-- Add payment-related columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS lemonsqueezy_customer_id VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lemonsqueezy_subscription_id VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_current_period_start TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_cancelled_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_paused_at TIMESTAMP;

-- Add usage tracking columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS usage_ai_requests INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS usage_products INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS usage_marketplace_listings INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS usage_file_uploads INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS usage_storage_bytes BIGINT DEFAULT 0;

-- Create subscription_events table for audit trail
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR NOT NULL,
  lemonsqueezy_subscription_id VARCHAR,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create orders table for tracking purchases
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lemonsqueezy_order_id VARCHAR UNIQUE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  amount DECIMAL NOT NULL,
  currency VARCHAR DEFAULT 'USD',
  status VARCHAR NOT NULL,
  product_type VARCHAR, -- 'subscription', 'one-time', 'marketplace-product', 'featured-listing'
  metadata JSONB,
  refunded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payment_methods table (for future use)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lemonsqueezy_payment_method_id VARCHAR,
  type VARCHAR NOT NULL, -- 'card', 'paypal', 'bank_transfer'
  last4 VARCHAR,
  brand VARCHAR,
  expiry_month INTEGER,
  expiry_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create invoices table (for future use)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lemonsqueezy_invoice_id VARCHAR UNIQUE,
  subscription_id UUID,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  amount DECIMAL NOT NULL,
  currency VARCHAR DEFAULT 'USD',
  status VARCHAR NOT NULL, -- 'draft', 'open', 'paid', 'void', 'uncollectible'
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Update sales_transactions table to include LemonSqueezy order reference
ALTER TABLE sales_transactions ADD COLUMN IF NOT EXISTS lemonsqueezy_order_id VARCHAR;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_lemonsqueezy_customer ON users(lemonsqueezy_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_lemonsqueezy_subscription ON users(lemonsqueezy_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_lemonsqueezy_id ON orders(lemonsqueezy_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Create RLS policies for subscription_events
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription events" ON subscription_events
  FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update orders" ON orders
  FOR UPDATE USING (true);

-- Create RLS policies for payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment methods" ON payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" ON payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" ON payment_methods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods" ON payment_methods
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

-- Create function to update usage tracking
CREATE OR REPLACE FUNCTION increment_user_usage(
  user_uuid UUID,
  usage_type VARCHAR,
  increment_by INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  CASE usage_type
    WHEN 'ai_requests' THEN
      UPDATE users SET usage_ai_requests = COALESCE(usage_ai_requests, 0) + increment_by WHERE id = user_uuid;
    WHEN 'products' THEN
      UPDATE users SET usage_products = COALESCE(usage_products, 0) + increment_by WHERE id = user_uuid;
    WHEN 'marketplace_listings' THEN
      UPDATE users SET usage_marketplace_listings = COALESCE(usage_marketplace_listings, 0) + increment_by WHERE id = user_uuid;
    WHEN 'file_uploads' THEN
      UPDATE users SET usage_file_uploads = COALESCE(usage_file_uploads, 0) + increment_by WHERE id = user_uuid;
    ELSE
      RAISE EXCEPTION 'Invalid usage type: %', usage_type;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update storage usage
CREATE OR REPLACE FUNCTION update_user_storage_usage(
  user_uuid UUID,
  bytes_change BIGINT
)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET usage_storage_bytes = GREATEST(COALESCE(usage_storage_bytes, 0) + bytes_change, 0)
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  user_uuid UUID,
  usage_type VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier VARCHAR;
  current_usage INTEGER;
  usage_limit INTEGER;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier FROM users WHERE id = user_uuid;
  
  -- Get current usage
  CASE usage_type
    WHEN 'ai_requests' THEN
      SELECT COALESCE(usage_ai_requests, 0) INTO current_usage FROM users WHERE id = user_uuid;
      usage_limit := CASE WHEN user_tier = 'pro' THEN -1 ELSE 10 END;
    WHEN 'products' THEN
      SELECT COALESCE(usage_products, 0) INTO current_usage FROM users WHERE id = user_uuid;
      usage_limit := CASE WHEN user_tier = 'pro' THEN -1 ELSE 3 END;
    WHEN 'marketplace_listings' THEN
      SELECT COALESCE(usage_marketplace_listings, 0) INTO current_usage FROM users WHERE id = user_uuid;
      usage_limit := CASE WHEN user_tier = 'pro' THEN -1 ELSE 1 END;
    WHEN 'file_uploads' THEN
      SELECT COALESCE(usage_file_uploads, 0) INTO current_usage FROM users WHERE id = user_uuid;
      usage_limit := CASE WHEN user_tier = 'pro' THEN -1 ELSE 5 END;
    ELSE
      RETURN FALSE;
  END CASE;
  
  -- -1 means unlimited (pro tier)
  IF usage_limit = -1 THEN
    RETURN TRUE;
  END IF;
  
  -- Check if under limit
  RETURN current_usage < usage_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset monthly usage (to be called by cron job)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS VOID AS $$
BEGIN
  UPDATE users SET
    usage_ai_requests = 0,
    usage_products = 0,
    usage_marketplace_listings = 0,
    usage_file_uploads = 0
  WHERE subscription_tier = 'free';
  
  -- Pro users keep their usage for analytics but don't have limits
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;