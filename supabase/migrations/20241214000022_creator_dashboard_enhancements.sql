-- Creator Dashboard Enhancements Migration
-- This migration ensures all fields needed for the creator dashboard are available

-- Add missing columns to products table if they don't exist
DO $$ 
BEGIN
    -- Add thumbnail column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'thumbnail') THEN
        ALTER TABLE products ADD COLUMN thumbnail TEXT;
    END IF;

    -- Add featured column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'featured') THEN
        ALTER TABLE products ADD COLUMN featured BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add allow_comments column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'allow_comments') THEN
        ALTER TABLE products ADD COLUMN allow_comments BOOLEAN DEFAULT TRUE;
    END IF;

    -- Add download_limit column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'download_limit') THEN
        ALTER TABLE products ADD COLUMN download_limit INTEGER DEFAULT 0;
    END IF;

    -- Add license_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'license_type') THEN
        ALTER TABLE products ADD COLUMN license_type TEXT DEFAULT 'standard';
    END IF;

    -- Add original_price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'original_price') THEN
        ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2);
    END IF;

    -- Add sales_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sales_count') THEN
        ALTER TABLE products ADD COLUMN sales_count INTEGER DEFAULT 0;
    END IF;

    -- Add view_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'view_count') THEN
        ALTER TABLE products ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;

    -- Add average_rating column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'average_rating') THEN
        ALTER TABLE products ADD COLUMN average_rating DECIMAL(3,2);
    END IF;

    -- Add review_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'review_count') THEN
        ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create product_files table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size BIGINT NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    description TEXT,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

-- Create creator_earnings table if it doesn't exist
CREATE TABLE IF NOT EXISTS creator_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    net_amount DECIMAL(10,2) NOT NULL,
    transaction_type TEXT NOT NULL DEFAULT 'sale',
    status TEXT NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create creator_payouts table if it doesn't exist
CREATE TABLE IF NOT EXISTS creator_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payout_method TEXT NOT NULL DEFAULT 'stripe',
    payout_details JSONB,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_creator_id ON products(creator_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_product_files_product_id ON product_files(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_earnings_creator_id ON creator_earnings(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_earnings_product_id ON creator_earnings(product_id);
CREATE INDEX IF NOT EXISTS idx_creator_payouts_creator_id ON creator_payouts(creator_id);

-- Add RLS policies for product_files
ALTER TABLE product_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files of published products" ON product_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_files.product_id 
            AND products.status = 'published'
        )
    );

CREATE POLICY "Creators can manage their product files" ON product_files
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_files.product_id 
            AND products.creator_id = auth.uid()
        )
    );

-- Add RLS policies for product_reviews
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON product_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for published products" ON product_reviews
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_reviews.product_id 
            AND products.status = 'published'
        )
    );

CREATE POLICY "Users can update their own reviews" ON product_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON product_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for creator_earnings
ALTER TABLE creator_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view their own earnings" ON creator_earnings
    FOR SELECT USING (auth.uid() = creator_id);

-- Add RLS policies for creator_payouts
ALTER TABLE creator_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view their own payouts" ON creator_payouts
    FOR SELECT USING (auth.uid() = creator_id);

-- Create function to update product ratings
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products SET
        average_rating = (
            SELECT AVG(rating)::DECIMAL(3,2)
            FROM product_reviews
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        ),
        review_count = (
            SELECT COUNT(*)
            FROM product_reviews
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update product ratings
DROP TRIGGER IF EXISTS update_product_rating_trigger ON product_reviews;
CREATE TRIGGER update_product_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_product_files_updated_at ON product_files;
CREATE TRIGGER update_product_files_updated_at
    BEFORE UPDATE ON product_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON product_reviews;
CREATE TRIGGER update_product_reviews_updated_at
    BEFORE UPDATE ON product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();