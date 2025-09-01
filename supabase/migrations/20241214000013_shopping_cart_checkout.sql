-- Shopping Cart and Checkout System Migration
-- This migration creates the shopping cart, checkout, and coupon system

-- Create coupon types
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed_amount', 'free_shipping');
CREATE TYPE coupon_status AS ENUM ('active', 'inactive', 'expired', 'used_up');

-- Shopping carts table
CREATE TABLE public.shopping_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- For guest users
    total_amount DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- Ensure either user_id or session_id is present
    CHECK (user_id IS NOT NULL OR session_id IS NOT NULL),
    
    -- Unique constraint for user carts (one active cart per user)
    UNIQUE(user_id) WHERE user_id IS NOT NULL
);

-- Cart items table
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.shopping_carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    bundle_id UUID REFERENCES public.product_bundles(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure either product_id or bundle_id is present
    CHECK (product_id IS NOT NULL OR bundle_id IS NOT NULL),
    
    -- Unique constraint to prevent duplicate items in cart
    UNIQUE(cart_id, product_id) WHERE product_id IS NOT NULL,
    UNIQUE(cart_id, bundle_id) WHERE bundle_id IS NOT NULL
);

-- Coupons table
CREATE TABLE public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    description TEXT,
    discount_type coupon_type NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value >= 0),
    minimum_amount DECIMAL(10,2) DEFAULT 0 CHECK (minimum_amount >= 0),
    maximum_discount DECIMAL(10,2) CHECK (maximum_discount IS NULL OR maximum_discount >= 0),
    usage_limit INTEGER CHECK (usage_limit IS NULL OR usage_limit > 0),
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    user_limit INTEGER DEFAULT 1 CHECK (user_limit > 0),
    applicable_to VARCHAR(20) DEFAULT 'all' CHECK (applicable_to IN ('all', 'products', 'bundles', 'categories')),
    applicable_ids UUID[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CHECK (expires_at IS NULL OR expires_at > starts_at),
    CHECK (usage_limit IS NULL OR usage_limit >= usage_count)
);

-- Coupon usage tracking
CREATE TABLE public.coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    cart_id UUID REFERENCES public.shopping_carts(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES public.sales_transactions(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10,2) NOT NULL CHECK (discount_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent multiple uses of same coupon by same user (if user_limit = 1)
    UNIQUE(coupon_id, user_id)
);

-- Checkout sessions table
CREATE TABLE public.checkout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.shopping_carts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
    
    -- Billing information
    billing_email VARCHAR(255) NOT NULL,
    billing_name VARCHAR(255) NOT NULL,
    billing_address JSONB,
    
    -- Payment information
    payment_method VARCHAR(50),
    payment_provider VARCHAR(50),
    payment_provider_session_id VARCHAR(255),
    
    -- Totals
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Applied coupons
    applied_coupons JSONB DEFAULT '[]',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Product recommendations for cart
CREATE TABLE public.cart_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.shopping_carts(id) ON DELETE CASCADE,
    recommended_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL, -- 'frequently_bought_together', 'similar', 'upsell', 'cross_sell'
    score DECIMAL(3,2) DEFAULT 0 CHECK (score >= 0 AND score <= 1),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(cart_id, recommended_product_id)
);

-- Address book for users
CREATE TABLE public.user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'billing' CHECK (type IN ('billing', 'shipping')),
    is_default BOOLEAN DEFAULT FALSE,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(2) NOT NULL, -- ISO country code
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_shopping_carts_user_id ON public.shopping_carts(user_id);
CREATE INDEX idx_shopping_carts_session_id ON public.shopping_carts(session_id);
CREATE INDEX idx_shopping_carts_expires_at ON public.shopping_carts(expires_at);

CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX idx_cart_items_bundle_id ON public.cart_items(bundle_id);

CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active ON public.coupons(is_active, starts_at, expires_at);
CREATE INDEX idx_coupons_applicable_to ON public.coupons(applicable_to);

CREATE INDEX idx_coupon_usage_coupon_id ON public.coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user_id ON public.coupon_usage(user_id);

CREATE INDEX idx_checkout_sessions_cart_id ON public.checkout_sessions(cart_id);
CREATE INDEX idx_checkout_sessions_user_id ON public.checkout_sessions(user_id);
CREATE INDEX idx_checkout_sessions_status ON public.checkout_sessions(status);
CREATE INDEX idx_checkout_sessions_expires_at ON public.checkout_sessions(expires_at);

CREATE INDEX idx_cart_recommendations_cart_id ON public.cart_recommendations(cart_id);
CREATE INDEX idx_cart_recommendations_type_score ON public.cart_recommendations(recommendation_type, score DESC);

CREATE INDEX idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX idx_user_addresses_default ON public.user_addresses(user_id, is_default) WHERE is_default = TRUE;

-- Functions for cart operations

-- Function to calculate cart total
CREATE OR REPLACE FUNCTION calculate_cart_total(cart_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total DECIMAL := 0;
BEGIN
    SELECT COALESCE(SUM(ci.price * ci.quantity), 0)
    INTO total
    FROM public.cart_items ci
    WHERE ci.cart_id = cart_uuid;
    
    -- Update cart total
    UPDATE public.shopping_carts
    SET total_amount = total,
        updated_at = NOW()
    WHERE id = cart_uuid;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate coupon
CREATE OR REPLACE FUNCTION validate_coupon(
    coupon_code VARCHAR,
    user_uuid UUID,
    cart_total DECIMAL
)
RETURNS TABLE(
    is_valid BOOLEAN,
    coupon_id UUID,
    discount_amount DECIMAL,
    error_message TEXT
) AS $$
DECLARE
    coupon_record RECORD;
    user_usage_count INTEGER;
    calculated_discount DECIMAL := 0;
BEGIN
    -- Get coupon details
    SELECT * INTO coupon_record
    FROM public.coupons c
    WHERE c.code = coupon_code
    AND c.is_active = TRUE
    AND (c.starts_at IS NULL OR c.starts_at <= NOW())
    AND (c.expires_at IS NULL OR c.expires_at > NOW());
    
    -- Check if coupon exists and is active
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 0::DECIMAL, 'Invalid or expired coupon code';
        RETURN;
    END IF;
    
    -- Check usage limits
    IF coupon_record.usage_limit IS NOT NULL AND coupon_record.usage_count >= coupon_record.usage_limit THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 0::DECIMAL, 'Coupon usage limit exceeded';
        RETURN;
    END IF;
    
    -- Check user usage limit
    SELECT COUNT(*) INTO user_usage_count
    FROM public.coupon_usage cu
    WHERE cu.coupon_id = coupon_record.id AND cu.user_id = user_uuid;
    
    IF user_usage_count >= coupon_record.user_limit THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 0::DECIMAL, 'You have already used this coupon';
        RETURN;
    END IF;
    
    -- Check minimum amount
    IF cart_total < coupon_record.minimum_amount THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 0::DECIMAL, 
            'Minimum order amount of $' || coupon_record.minimum_amount || ' required';
        RETURN;
    END IF;
    
    -- Calculate discount
    IF coupon_record.discount_type = 'percentage' THEN
        calculated_discount := cart_total * (coupon_record.discount_value / 100);
    ELSIF coupon_record.discount_type = 'fixed_amount' THEN
        calculated_discount := coupon_record.discount_value;
    END IF;
    
    -- Apply maximum discount limit
    IF coupon_record.maximum_discount IS NOT NULL AND calculated_discount > coupon_record.maximum_discount THEN
        calculated_discount := coupon_record.maximum_discount;
    END IF;
    
    -- Ensure discount doesn't exceed cart total
    IF calculated_discount > cart_total THEN
        calculated_discount := cart_total;
    END IF;
    
    RETURN QUERY SELECT TRUE, coupon_record.id, calculated_discount, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get cart recommendations
CREATE OR REPLACE FUNCTION get_cart_recommendations(cart_uuid UUID, limit_count INTEGER DEFAULT 5)
RETURNS TABLE(
    product_id UUID,
    name VARCHAR,
    price DECIMAL,
    recommendation_type VARCHAR,
    score DECIMAL,
    reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        COALESCE(ml.price, p.price),
        cr.recommendation_type,
        cr.score,
        cr.reason
    FROM public.cart_recommendations cr
    JOIN public.products p ON cr.recommended_product_id = p.id
    LEFT JOIN public.marketplace_listings ml ON p.id = ml.product_id AND ml.status = 'active'
    WHERE cr.cart_id = cart_uuid
        AND p.status = 'published'
    ORDER BY cr.score DESC, cr.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired carts
CREATE OR REPLACE FUNCTION cleanup_expired_carts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.shopping_carts
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at
CREATE TRIGGER update_shopping_carts_updated_at 
    BEFORE UPDATE ON public.shopping_carts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at 
    BEFORE UPDATE ON public.coupons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkout_sessions_updated_at 
    BEFORE UPDATE ON public.checkout_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at 
    BEFORE UPDATE ON public.user_addresses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update cart total when items change
CREATE OR REPLACE FUNCTION update_cart_total_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM calculate_cart_total(OLD.cart_id);
        RETURN OLD;
    ELSE
        PERFORM calculate_cart_total(NEW.cart_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cart_items_update_total
    AFTER INSERT OR UPDATE OR DELETE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION update_cart_total_trigger();

-- RLS Policies
ALTER TABLE public.shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Shopping carts policies
CREATE POLICY "Users can manage their own carts" ON public.shopping_carts
    FOR ALL USING (
        user_id = auth.uid() OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    );

-- Cart items policies
CREATE POLICY "Users can manage their cart items" ON public.cart_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.shopping_carts sc
            WHERE sc.id = cart_id
            AND (sc.user_id = auth.uid() OR (sc.user_id IS NULL AND sc.session_id IS NOT NULL))
        )
    );

-- Coupons policies
CREATE POLICY "Coupons are viewable by everyone" ON public.coupons
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Only admins can manage coupons" ON public.coupons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Coupon usage policies
CREATE POLICY "Users can view their own coupon usage" ON public.coupon_usage
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert coupon usage" ON public.coupon_usage
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Checkout sessions policies
CREATE POLICY "Users can manage their checkout sessions" ON public.checkout_sessions
    FOR ALL USING (
        user_id = auth.uid() OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    );

-- Cart recommendations policies
CREATE POLICY "Users can view their cart recommendations" ON public.cart_recommendations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.shopping_carts sc
            WHERE sc.id = cart_id
            AND (sc.user_id = auth.uid() OR (sc.user_id IS NULL AND sc.session_id IS NOT NULL))
        )
    );

-- User addresses policies
CREATE POLICY "Users can manage their own addresses" ON public.user_addresses
    FOR ALL USING (user_id = auth.uid());