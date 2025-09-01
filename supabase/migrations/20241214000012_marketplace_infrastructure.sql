-- Marketplace Infrastructure Migration
-- This migration adds promotional tools and marketplace enhancements

-- Create promotion types
CREATE TYPE promotion_type AS ENUM ('featured', 'discount', 'bundle', 'flash_sale');

-- Promotions table for managing promotional campaigns
CREATE TABLE public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type promotion_type NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    discount_percentage DECIMAL(5,2) CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CHECK (end_date > start_date)
);

-- Junction table for promotion products
CREATE TABLE public.promotion_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(promotion_id, product_id)
);

-- Product views tracking for analytics
CREATE TABLE public.product_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX(product_id, viewed_at),
    INDEX(user_id, viewed_at)
);

-- Product search analytics
CREATE TABLE public.search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    results_count INTEGER DEFAULT 0,
    clicked_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    search_filters JSONB DEFAULT '{}',
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX(query),
    INDEX(searched_at),
    INDEX(user_id, searched_at)
);

-- Marketplace wishlists
CREATE TABLE public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, product_id),
    INDEX(user_id, added_at),
    INDEX(product_id)
);

-- Product recommendations tracking
CREATE TABLE public.product_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    recommended_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL, -- 'similar', 'frequently_bought_together', 'trending', etc.
    score DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX(user_id, recommendation_type),
    INDEX(product_id, recommendation_type),
    INDEX(score DESC)
);

-- Enhanced indexes for marketplace performance
CREATE INDEX idx_products_marketplace_search ON public.products USING GIN(
    to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || array_to_string(tags, ' '))
);

CREATE INDEX idx_marketplace_listings_price ON public.marketplace_listings(price);
CREATE INDEX idx_marketplace_listings_featured_until ON public.marketplace_listings(featured_until) WHERE is_featured = true;
CREATE INDEX idx_marketplace_listings_discount ON public.marketplace_listings(discount_percentage) WHERE discount_percentage > 0;

CREATE INDEX idx_products_quality_score ON public.products(quality_score DESC);
CREATE INDEX idx_products_view_count ON public.products(view_count DESC);
CREATE INDEX idx_products_download_count ON public.products(download_count DESC);

-- Indexes for promotions
CREATE INDEX idx_promotions_type ON public.promotions(type);
CREATE INDEX idx_promotions_active_dates ON public.promotions(is_active, start_date, end_date);
CREATE INDEX idx_promotion_products_promotion_id ON public.promotion_products(promotion_id);
CREATE INDEX idx_promotion_products_product_id ON public.promotion_products(product_id);

-- RPC Functions for marketplace operations

-- Function to increment product view count
CREATE OR REPLACE FUNCTION increment_product_views(product_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.products 
    SET view_count = view_count + 1,
        updated_at = NOW()
    WHERE id = product_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment listing sales count
CREATE OR REPLACE FUNCTION increment_listing_sales(listing_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.marketplace_listings 
    SET sales_count = sales_count + 1,
        updated_at = NOW()
    WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending products
CREATE OR REPLACE FUNCTION get_trending_products(days_back INTEGER DEFAULT 7, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    product_id UUID,
    name VARCHAR,
    view_count BIGINT,
    sales_count BIGINT,
    trend_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        COUNT(pv.id) as view_count,
        COALESCE(ml.sales_count, 0) as sales_count,
        (COUNT(pv.id) * 0.3 + COALESCE(ml.sales_count, 0) * 0.7) as trend_score
    FROM public.products p
    LEFT JOIN public.product_views pv ON p.id = pv.product_id 
        AND pv.viewed_at >= NOW() - INTERVAL '%s days' % days_back
    LEFT JOIN public.marketplace_listings ml ON p.id = ml.product_id
    WHERE p.status = 'published'
    GROUP BY p.id, p.name, ml.sales_count
    ORDER BY trend_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get product recommendations
CREATE OR REPLACE FUNCTION get_product_recommendations(
    target_product_id UUID,
    recommendation_type VARCHAR DEFAULT 'similar',
    limit_count INTEGER DEFAULT 5
)
RETURNS TABLE(
    product_id UUID,
    name VARCHAR,
    score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.recommended_product_id,
        p.name,
        pr.score
    FROM public.product_recommendations pr
    JOIN public.products p ON pr.recommended_product_id = p.id
    WHERE pr.product_id = target_product_id
        AND pr.recommendation_type = get_product_recommendations.recommendation_type
        AND p.status = 'published'
    ORDER BY pr.score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search products with ranking
CREATE OR REPLACE FUNCTION search_marketplace_products(
    search_query TEXT,
    category_filter UUID DEFAULT NULL,
    min_price DECIMAL DEFAULT NULL,
    max_price DECIMAL DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    product_id UUID,
    listing_id UUID,
    name VARCHAR,
    price DECIMAL,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        ml.id,
        p.name,
        ml.price,
        ts_rank(
            to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || array_to_string(p.tags, ' ')),
            plainto_tsquery('english', search_query)
        ) as rank
    FROM public.products p
    JOIN public.marketplace_listings ml ON p.id = ml.product_id
    WHERE p.status = 'published'
        AND ml.status = 'active'
        AND (category_filter IS NULL OR p.category_id = category_filter)
        AND (min_price IS NULL OR ml.price >= min_price)
        AND (max_price IS NULL OR ml.price <= max_price)
        AND to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || array_to_string(p.tags, ' ')) 
            @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC, ml.sales_count DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for updated_at
CREATE TRIGGER update_promotions_updated_at 
    BEFORE UPDATE ON public.promotions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for promotions (admin only for modifications)
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_recommendations ENABLE ROW LEVEL SECURITY;

-- Promotions policies
CREATE POLICY "Promotions are viewable by everyone" ON public.promotions
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage promotions" ON public.promotions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Promotion products policies
CREATE POLICY "Promotion products are viewable by everyone" ON public.promotion_products
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage promotion products" ON public.promotion_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Product views policies
CREATE POLICY "Users can view their own product views" ON public.product_views
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert product views" ON public.product_views
    FOR INSERT WITH CHECK (true);

-- Search analytics policies
CREATE POLICY "Users can view their own search analytics" ON public.search_analytics
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert search analytics" ON public.search_analytics
    FOR INSERT WITH CHECK (true);

-- Wishlists policies
CREATE POLICY "Users can manage their own wishlists" ON public.wishlists
    FOR ALL USING (user_id = auth.uid());

-- Product recommendations policies
CREATE POLICY "Product recommendations are viewable by everyone" ON public.product_recommendations
    FOR SELECT USING (true);

CREATE POLICY "Only system can manage recommendations" ON public.product_recommendations
    FOR ALL USING (false); -- Only through RPC functions