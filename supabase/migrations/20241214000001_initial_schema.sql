-- Initial Database Schema for AI Product Creator
-- This migration creates the core tables with proper relationships and constraints

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE product_status AS ENUM ('draft', 'published', 'archived', 'deleted');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator', 'super_admin');
CREATE TYPE listing_status AS ENUM ('active', 'inactive', 'sold_out', 'pending_review');
CREATE TYPE affiliate_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE competition_status AS ENUM ('upcoming', 'active', 'ended', 'cancelled');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
CREATE TYPE pricing_type AS ENUM ('free', 'one_time', 'subscription', 'bundle');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    role user_role DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    profile_data JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles for extended information
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    bio TEXT,
    website_url TEXT,
    social_links JSONB DEFAULT '{}',
    skills TEXT[],
    location VARCHAR(255),
    timezone VARCHAR(50),
    portfolio_data JSONB DEFAULT '{}',
    verification_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product categories
CREATE TABLE public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.product_categories(id),
    icon_url TEXT,
    color VARCHAR(7), -- Hex color code
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.product_categories(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    content JSONB DEFAULT '{}',
    pricing_type pricing_type DEFAULT 'free',
    price DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    subscription_interval VARCHAR(20), -- 'monthly', 'yearly'
    features TEXT[],
    tags TEXT[],
    assets JSONB DEFAULT '{}', -- URLs to files, images, etc.
    metadata JSONB DEFAULT '{}',
    status product_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    quality_score DECIMAL(3,2) DEFAULT 0,
    seo_title VARCHAR(255),
    seo_description VARCHAR(500),
    seo_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, slug)
);

-- Scraped products for analysis
CREATE TABLE public.scraped_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL UNIQUE,
    domain VARCHAR(255),
    title VARCHAR(500),
    description TEXT,
    price DECIMAL(10,2),
    currency VARCHAR(3),
    category VARCHAR(100),
    images TEXT[],
    content JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    analysis_data JSONB DEFAULT '{}',
    scrape_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0
);

-- Market trends and predictions
CREATE TABLE public.market_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    trend_data JSONB NOT NULL DEFAULT '{}',
    predictions JSONB DEFAULT '{}',
    confidence_score DECIMAL(3,2) DEFAULT 0,
    data_sources TEXT[],
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace listings
CREATE TABLE public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    status listing_status DEFAULT 'active',
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP WITH TIME ZONE,
    sales_count INTEGER DEFAULT 0,
    commission_rate DECIMAL(5,4) DEFAULT 0.30, -- Platform commission (30%)
    affiliate_commission_rate DECIMAL(5,4) DEFAULT 0.10, -- Affiliate commission (10%)
    listing_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(product_id)
);

-- Product bundles
CREATE TABLE public.product_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    bundle_price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    status listing_status DEFAULT 'active',
    is_featured BOOLEAN DEFAULT FALSE,
    sales_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(creator_id, slug)
);

-- Bundle items (products in bundles)
CREATE TABLE public.bundle_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID NOT NULL REFERENCES public.product_bundles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(bundle_id, product_id)
);

-- Shopping carts
CREATE TABLE public.shopping_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- For guest users
    total_amount DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Cart items
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.shopping_carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    bundle_id UUID REFERENCES public.product_bundles(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CHECK (
        (product_id IS NOT NULL AND bundle_id IS NULL) OR 
        (product_id IS NULL AND bundle_id IS NOT NULL)
    )
);

-- Affiliates
CREATE TABLE public.affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    affiliate_code VARCHAR(50) NOT NULL UNIQUE,
    commission_rate DECIMAL(5,4) DEFAULT 0.10, -- 10%
    total_earnings DECIMAL(10,2) DEFAULT 0,
    total_referrals INTEGER DEFAULT 0,
    total_sales DECIMAL(10,2) DEFAULT 0,
    status affiliate_status DEFAULT 'pending',
    payment_info JSONB DEFAULT '{}',
    performance_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Sales transactions
CREATE TABLE public.sales_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.users(id),
    seller_id UUID NOT NULL REFERENCES public.users(id),
    product_id UUID REFERENCES public.products(id),
    bundle_id UUID REFERENCES public.product_bundles(id),
    affiliate_id UUID REFERENCES public.affiliates(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    platform_fee DECIMAL(10,2) DEFAULT 0,
    seller_earnings DECIMAL(10,2) DEFAULT 0,
    affiliate_commission DECIMAL(10,2) DEFAULT 0,
    payment_status payment_status DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_provider_id VARCHAR(255), -- LemonSqueezy order ID
    payment_data JSONB DEFAULT '{}',
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CHECK (
        (product_id IS NOT NULL AND bundle_id IS NULL) OR 
        (product_id IS NULL AND bundle_id IS NOT NULL)
    )
);

-- Affiliate referrals
CREATE TABLE public.affiliate_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES public.users(id),
    transaction_id UUID REFERENCES public.sales_transactions(id),
    referral_code VARCHAR(50),
    commission_earned DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'paid'
    conversion_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX idx_users_subscription_tier ON public.users(subscription_tier);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_created_at ON public.users(created_at);

CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_created_at ON public.products(created_at);
CREATE INDEX idx_products_published_at ON public.products(published_at);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);
CREATE INDEX idx_products_tags ON public.products USING GIN(tags);
CREATE INDEX idx_products_search ON public.products USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE INDEX idx_scraped_products_domain ON public.scraped_products(domain);
CREATE INDEX idx_scraped_products_scrape_date ON public.scraped_products(scrape_date);
CREATE INDEX idx_scraped_products_status ON public.scraped_products(status);

CREATE INDEX idx_market_trends_category ON public.market_trends(category);
CREATE INDEX idx_market_trends_analysis_date ON public.market_trends(analysis_date);

CREATE INDEX idx_marketplace_listings_seller_id ON public.marketplace_listings(seller_id);
CREATE INDEX idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX idx_marketplace_listings_is_featured ON public.marketplace_listings(is_featured);
CREATE INDEX idx_marketplace_listings_created_at ON public.marketplace_listings(created_at);

CREATE INDEX idx_sales_transactions_buyer_id ON public.sales_transactions(buyer_id);
CREATE INDEX idx_sales_transactions_seller_id ON public.sales_transactions(seller_id);
CREATE INDEX idx_sales_transactions_payment_status ON public.sales_transactions(payment_status);
CREATE INDEX idx_sales_transactions_created_at ON public.sales_transactions(created_at);

CREATE INDEX idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX idx_affiliates_affiliate_code ON public.affiliates(affiliate_code);
CREATE INDEX idx_affiliates_status ON public.affiliates(status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scraped_products_updated_at BEFORE UPDATE ON public.scraped_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_market_trends_updated_at BEFORE UPDATE ON public.market_trends FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON public.marketplace_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_bundles_updated_at BEFORE UPDATE ON public.product_bundles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopping_carts_updated_at BEFORE UPDATE ON public.shopping_carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON public.affiliates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_transactions_updated_at BEFORE UPDATE ON public.sales_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliate_referrals_updated_at BEFORE UPDATE ON public.affiliate_referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();