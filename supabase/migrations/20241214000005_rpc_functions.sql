-- RPC Functions for Database Operations
-- This migration adds stored procedures for atomic operations

-- Function to increment product likes
CREATE OR REPLACE FUNCTION increment_product_likes(product_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.products 
  SET like_count = like_count + 1 
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement product likes
CREATE OR REPLACE FUNCTION decrement_product_likes(product_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.products 
  SET like_count = GREATEST(like_count - 1, 0) 
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment product views
CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.products 
  SET view_count = view_count + 1 
  WHERE id = product_id
  RETURNING view_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment product downloads
CREATE OR REPLACE FUNCTION increment_product_downloads(product_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.products 
  SET download_count = download_count + 1 
  WHERE id = product_id
  RETURNING download_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to execute raw SQL (for migrations)
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate cart total
CREATE OR REPLACE FUNCTION calculate_cart_total(cart_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total DECIMAL;
BEGIN
  SELECT COALESCE(SUM(price * quantity), 0)
  INTO total
  FROM public.cart_items
  WHERE cart_items.cart_id = calculate_cart_total.cart_id;
  
  UPDATE public.shopping_carts
  SET total_amount = total
  WHERE id = calculate_cart_total.cart_id;
  
  RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user subscription limits
CREATE OR REPLACE FUNCTION get_user_limits(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  user_tier TEXT;
  limits JSONB;
BEGIN
  SELECT subscription_tier INTO user_tier
  FROM public.users
  WHERE id = user_id;
  
  CASE user_tier
    WHEN 'free' THEN
      limits := '{"products": 3, "storage_mb": 100, "api_calls": 100}';
    WHEN 'pro' THEN
      limits := '{"products": 50, "storage_mb": 5000, "api_calls": 5000}';
    WHEN 'enterprise' THEN
      limits := '{"products": -1, "storage_mb": 50000, "api_calls": 50000}';
    ELSE
      limits := '{"products": 0, "storage_mb": 0, "api_calls": 0}';
  END CASE;
  
  RETURN limits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create product
CREATE OR REPLACE FUNCTION can_create_product(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  limits JSONB;
  current_count INTEGER;
  max_products INTEGER;
BEGIN
  -- Get user limits
  limits := get_user_limits(user_id);
  max_products := (limits->>'products')::INTEGER;
  
  -- If unlimited (-1), return true
  IF max_products = -1 THEN
    RETURN TRUE;
  END IF;
  
  -- Count current products
  SELECT COUNT(*)
  INTO current_count
  FROM public.products
  WHERE products.user_id = can_create_product.user_id
  AND status != 'deleted';
  
  RETURN current_count < max_products;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search products with full-text search
CREATE OR REPLACE FUNCTION search_products(
  search_query TEXT,
  category_filter UUID DEFAULT NULL,
  min_price DECIMAL DEFAULT NULL,
  max_price DECIMAL DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  description TEXT,
  price DECIMAL,
  user_name VARCHAR,
  category_name VARCHAR,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    u.full_name as user_name,
    pc.name as category_name,
    ts_rank(
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM public.products p
  LEFT JOIN public.users u ON p.user_id = u.id
  LEFT JOIN public.product_categories pc ON p.category_id = pc.id
  WHERE p.status = 'published'
    AND (category_filter IS NULL OR p.category_id = category_filter)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND (
      search_query IS NULL OR
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) 
      @@ plainto_tsquery('english', search_query)
    )
  ORDER BY rank DESC, p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment listing sales count
CREATE OR REPLACE FUNCTION increment_listing_sales(listing_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.marketplace_listings 
  SET sales_count = sales_count + 1 
  WHERE id = listing_id
  RETURNING sales_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_product_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_product_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_product_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_product_downloads(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_listing_sales(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_cart_total(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_limits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_create_product(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_products(TEXT, UUID, DECIMAL, DECIMAL, INTEGER, INTEGER) TO authenticated;

-- Grant execute permissions to service role for migrations
GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO service_role;