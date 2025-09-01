-- Quality and Trust System Migration
-- This migration creates tables and functions for quality scoring, plagiarism detection,
-- authenticity verification, and creator verification system

-- Create quality and trust related enums
CREATE TYPE quality_check_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'expired');
CREATE TYPE badge_type AS ENUM ('creator_verified', 'top_seller', 'quality_assured', 'original_content', 'trusted_partner', 'expert_level');
CREATE TYPE plagiarism_status AS ENUM ('clean', 'suspicious', 'plagiarized', 'checking');

-- Product quality scores table
CREATE TABLE public.product_quality_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    overall_score DECIMAL(3,2) NOT NULL DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 10),
    
    -- Individual quality factors (0-10 scale)
    content_quality_score DECIMAL(3,2) DEFAULT 0,
    originality_score DECIMAL(3,2) DEFAULT 0,
    technical_quality_score DECIMAL(3,2) DEFAULT 0,
    user_feedback_score DECIMAL(3,2) DEFAULT 0,
    market_performance_score DECIMAL(3,2) DEFAULT 0,
    creator_reputation_score DECIMAL(3,2) DEFAULT 0,
    
    -- Quality factors metadata
    quality_factors JSONB DEFAULT '{}',
    
    -- Scoring algorithm version
    algorithm_version VARCHAR(10) DEFAULT '1.0',
    
    -- Timestamps
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(product_id)
);

-- Plagiarism detection results
CREATE TABLE public.plagiarism_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    content_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of content
    status plagiarism_status DEFAULT 'pending',
    
    -- Plagiarism detection results
    similarity_percentage DECIMAL(5,2) DEFAULT 0,
    matches_found INTEGER DEFAULT 0,
    suspicious_sources JSONB DEFAULT '[]',
    
    -- Detection metadata
    detection_engine VARCHAR(50) DEFAULT 'internal',
    detection_details JSONB DEFAULT '{}',
    
    -- Timestamps
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(product_id, content_hash)
);

-- Authenticity certificates
CREATE TABLE public.authenticity_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    certificate_number VARCHAR(20) UNIQUE NOT NULL,
    
    -- Certificate details
    verification_status verification_status DEFAULT 'pending',
    certificate_type VARCHAR(50) NOT NULL, -- 'original_work', 'verified_creator', 'quality_assured'
    
    -- Verification data
    verification_method VARCHAR(100),
    verification_evidence JSONB DEFAULT '{}',
    verifier_id UUID REFERENCES auth.users(id),
    
    -- Certificate validity
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revocation_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(product_id, certificate_type)
);

-- Creator verification system
CREATE TABLE public.creator_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Verification status and type
    verification_status verification_status DEFAULT 'pending',
    verification_level INTEGER DEFAULT 1 CHECK (verification_level >= 1 AND verification_level <= 5),
    
    -- Identity verification
    identity_verified BOOLEAN DEFAULT FALSE,
    identity_documents JSONB DEFAULT '[]',
    
    -- Professional verification
    professional_credentials JSONB DEFAULT '{}',
    portfolio_verified BOOLEAN DEFAULT FALSE,
    social_media_verified BOOLEAN DEFAULT FALSE,
    
    -- Business verification (for business accounts)
    business_verified BOOLEAN DEFAULT FALSE,
    business_documents JSONB DEFAULT '[]',
    tax_id_verified BOOLEAN DEFAULT FALSE,
    
    -- Verification metadata
    verification_notes TEXT,
    verifier_id UUID REFERENCES auth.users(id),
    verification_evidence JSONB DEFAULT '{}',
    
    -- Timestamps
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Creator badges system
CREATE TABLE public.creator_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_type badge_type NOT NULL,
    
    -- Badge details
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT,
    badge_icon_url TEXT,
    badge_color VARCHAR(7), -- Hex color code
    
    -- Badge criteria and achievement
    criteria_met JSONB DEFAULT '{}',
    achievement_data JSONB DEFAULT '{}',
    
    -- Badge validity
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, badge_type)
);

-- Quality check jobs for async processing
CREATE TABLE public.quality_check_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    
    -- Job details
    job_type VARCHAR(50) NOT NULL, -- 'quality_score', 'plagiarism_check', 'authenticity_verify'
    status quality_check_status DEFAULT 'pending',
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    
    -- Job configuration
    job_config JSONB DEFAULT '{}',
    
    -- Processing details
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Results
    job_results JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trust metrics aggregation table
CREATE TABLE public.trust_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Overall trust score (0-100)
    trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
    
    -- Individual trust factors
    verification_score INTEGER DEFAULT 0,
    quality_score INTEGER DEFAULT 0,
    community_score INTEGER DEFAULT 0,
    transaction_score INTEGER DEFAULT 0,
    longevity_score INTEGER DEFAULT 0,
    
    -- Trust metrics metadata
    total_products INTEGER DEFAULT 0,
    verified_products INTEGER DEFAULT 0,
    average_product_quality DECIMAL(3,2) DEFAULT 0,
    positive_reviews_ratio DECIMAL(3,2) DEFAULT 0,
    successful_transactions INTEGER DEFAULT 0,
    
    -- Calculation metadata
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    calculation_version VARCHAR(10) DEFAULT '1.0',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX idx_product_quality_scores_product_id ON public.product_quality_scores(product_id);
CREATE INDEX idx_product_quality_scores_overall_score ON public.product_quality_scores(overall_score DESC);
CREATE INDEX idx_product_quality_scores_expires_at ON public.product_quality_scores(expires_at);

CREATE INDEX idx_plagiarism_checks_product_id ON public.plagiarism_checks(product_id);
CREATE INDEX idx_plagiarism_checks_status ON public.plagiarism_checks(status);
CREATE INDEX idx_plagiarism_checks_content_hash ON public.plagiarism_checks(content_hash);

CREATE INDEX idx_authenticity_certificates_product_id ON public.authenticity_certificates(product_id);
CREATE INDEX idx_authenticity_certificates_status ON public.authenticity_certificates(verification_status);
CREATE INDEX idx_authenticity_certificates_number ON public.authenticity_certificates(certificate_number);

CREATE INDEX idx_creator_verifications_user_id ON public.creator_verifications(user_id);
CREATE INDEX idx_creator_verifications_status ON public.creator_verifications(verification_status);
CREATE INDEX idx_creator_verifications_level ON public.creator_verifications(verification_level);

CREATE INDEX idx_creator_badges_user_id ON public.creator_badges(user_id);
CREATE INDEX idx_creator_badges_type ON public.creator_badges(badge_type);
CREATE INDEX idx_creator_badges_active ON public.creator_badges(is_active);

CREATE INDEX idx_quality_check_jobs_product_id ON public.quality_check_jobs(product_id);
CREATE INDEX idx_quality_check_jobs_status ON public.quality_check_jobs(status);
CREATE INDEX idx_quality_check_jobs_type ON public.quality_check_jobs(job_type);
CREATE INDEX idx_quality_check_jobs_priority ON public.quality_check_jobs(priority DESC);

CREATE INDEX idx_trust_metrics_user_id ON public.trust_metrics(user_id);
CREATE INDEX idx_trust_metrics_trust_score ON public.trust_metrics(trust_score DESC);

-- Create functions for quality score calculation
CREATE OR REPLACE FUNCTION calculate_product_quality_score(p_product_id UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    v_content_score DECIMAL(3,2) := 0;
    v_originality_score DECIMAL(3,2) := 0;
    v_technical_score DECIMAL(3,2) := 0;
    v_feedback_score DECIMAL(3,2) := 0;
    v_performance_score DECIMAL(3,2) := 0;
    v_creator_score DECIMAL(3,2) := 0;
    v_overall_score DECIMAL(3,2) := 0;
BEGIN
    -- Calculate content quality (based on description length, completeness, etc.)
    SELECT CASE 
        WHEN LENGTH(COALESCE(description, '')) > 500 THEN 8.0
        WHEN LENGTH(COALESCE(description, '')) > 200 THEN 6.0
        WHEN LENGTH(COALESCE(description, '')) > 50 THEN 4.0
        ELSE 2.0
    END INTO v_content_score
    FROM public.products 
    WHERE id = p_product_id;
    
    -- Calculate originality score (based on plagiarism checks)
    SELECT CASE 
        WHEN pc.similarity_percentage IS NULL THEN 5.0 -- Not checked yet
        WHEN pc.similarity_percentage < 10 THEN 10.0
        WHEN pc.similarity_percentage < 25 THEN 8.0
        WHEN pc.similarity_percentage < 50 THEN 6.0
        WHEN pc.similarity_percentage < 75 THEN 4.0
        ELSE 2.0
    END INTO v_originality_score
    FROM public.plagiarism_checks pc
    WHERE pc.product_id = p_product_id
    ORDER BY pc.checked_at DESC
    LIMIT 1;
    
    -- Set default if no plagiarism check found
    v_originality_score := COALESCE(v_originality_score, 5.0);
    
    -- Calculate technical quality (placeholder - can be enhanced with file analysis)
    v_technical_score := 7.0;
    
    -- Calculate user feedback score (based on reviews - placeholder)
    v_feedback_score := 7.0;
    
    -- Calculate market performance score (based on sales, views, etc.)
    v_performance_score := 6.0;
    
    -- Calculate creator reputation score
    SELECT COALESCE(trust_score / 10.0, 5.0) INTO v_creator_score
    FROM public.trust_metrics tm
    JOIN public.products p ON p.user_id = tm.user_id
    WHERE p.id = p_product_id;
    
    -- Calculate weighted overall score
    v_overall_score := (
        v_content_score * 0.20 +
        v_originality_score * 0.25 +
        v_technical_score * 0.15 +
        v_feedback_score * 0.20 +
        v_performance_score * 0.10 +
        v_creator_score * 0.10
    );
    
    -- Insert or update quality score
    INSERT INTO public.product_quality_scores (
        product_id,
        overall_score,
        content_quality_score,
        originality_score,
        technical_quality_score,
        user_feedback_score,
        market_performance_score,
        creator_reputation_score,
        calculated_at,
        expires_at
    ) VALUES (
        p_product_id,
        v_overall_score,
        v_content_score,
        v_originality_score,
        v_technical_score,
        v_feedback_score,
        v_performance_score,
        v_creator_score,
        NOW(),
        NOW() + INTERVAL '30 days'
    )
    ON CONFLICT (product_id) DO UPDATE SET
        overall_score = EXCLUDED.overall_score,
        content_quality_score = EXCLUDED.content_quality_score,
        originality_score = EXCLUDED.originality_score,
        technical_quality_score = EXCLUDED.technical_quality_score,
        user_feedback_score = EXCLUDED.user_feedback_score,
        market_performance_score = EXCLUDED.market_performance_score,
        creator_reputation_score = EXCLUDED.creator_reputation_score,
        calculated_at = EXCLUDED.calculated_at,
        expires_at = EXCLUDED.expires_at,
        updated_at = NOW();
    
    RETURN v_overall_score;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate trust metrics for a user
CREATE OR REPLACE FUNCTION calculate_user_trust_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_verification_score INTEGER := 0;
    v_quality_score INTEGER := 0;
    v_community_score INTEGER := 0;
    v_transaction_score INTEGER := 0;
    v_longevity_score INTEGER := 0;
    v_trust_score INTEGER := 0;
    v_total_products INTEGER := 0;
    v_verified_products INTEGER := 0;
    v_avg_quality DECIMAL(3,2) := 0;
BEGIN
    -- Calculate verification score (0-20 points)
    SELECT CASE 
        WHEN cv.verification_level >= 5 THEN 20
        WHEN cv.verification_level >= 4 THEN 16
        WHEN cv.verification_level >= 3 THEN 12
        WHEN cv.verification_level >= 2 THEN 8
        WHEN cv.verification_level >= 1 THEN 4
        ELSE 0
    END INTO v_verification_score
    FROM public.creator_verifications cv
    WHERE cv.user_id = p_user_id AND cv.verification_status = 'verified';
    
    v_verification_score := COALESCE(v_verification_score, 0);
    
    -- Calculate quality score based on average product quality (0-25 points)
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE ac.verification_status = 'verified'),
        COALESCE(AVG(pqs.overall_score), 0)
    INTO v_total_products, v_verified_products, v_avg_quality
    FROM public.products p
    LEFT JOIN public.product_quality_scores pqs ON p.id = pqs.product_id
    LEFT JOIN public.authenticity_certificates ac ON p.id = ac.product_id
    WHERE p.user_id = p_user_id;
    
    v_quality_score := LEAST(25, ROUND(v_avg_quality * 2.5));
    
    -- Calculate community score (placeholder - 0-20 points)
    v_community_score := 15; -- Default good standing
    
    -- Calculate transaction score (placeholder - 0-20 points)
    v_transaction_score := 18; -- Default good transaction history
    
    -- Calculate longevity score based on account age (0-15 points)
    SELECT CASE 
        WHEN created_at < NOW() - INTERVAL '2 years' THEN 15
        WHEN created_at < NOW() - INTERVAL '1 year' THEN 12
        WHEN created_at < NOW() - INTERVAL '6 months' THEN 8
        WHEN created_at < NOW() - INTERVAL '3 months' THEN 5
        ELSE 2
    END INTO v_longevity_score
    FROM auth.users
    WHERE id = p_user_id;
    
    v_longevity_score := COALESCE(v_longevity_score, 0);
    
    -- Calculate total trust score
    v_trust_score := v_verification_score + v_quality_score + v_community_score + v_transaction_score + v_longevity_score;
    
    -- Insert or update trust metrics
    INSERT INTO public.trust_metrics (
        user_id,
        trust_score,
        verification_score,
        quality_score,
        community_score,
        transaction_score,
        longevity_score,
        total_products,
        verified_products,
        average_product_quality,
        last_calculated_at
    ) VALUES (
        p_user_id,
        v_trust_score,
        v_verification_score,
        v_quality_score,
        v_community_score,
        v_transaction_score,
        v_longevity_score,
        v_total_products,
        v_verified_products,
        v_avg_quality,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        trust_score = EXCLUDED.trust_score,
        verification_score = EXCLUDED.verification_score,
        quality_score = EXCLUDED.quality_score,
        community_score = EXCLUDED.community_score,
        transaction_score = EXCLUDED.transaction_score,
        longevity_score = EXCLUDED.longevity_score,
        total_products = EXCLUDED.total_products,
        verified_products = EXCLUDED.verified_products,
        average_product_quality = EXCLUDED.average_product_quality,
        last_calculated_at = EXCLUDED.last_calculated_at,
        updated_at = NOW();
    
    RETURN v_trust_score;
END;
$$ LANGUAGE plpgsql;

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    v_prefix VARCHAR(3) := 'APC'; -- AI Product Creator
    v_year VARCHAR(4) := EXTRACT(YEAR FROM NOW())::VARCHAR;
    v_sequence INTEGER;
    v_certificate_number VARCHAR(20);
BEGIN
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(
        CASE 
            WHEN certificate_number ~ ('^' || v_prefix || v_year || '[0-9]+$') 
            THEN SUBSTRING(certificate_number FROM LENGTH(v_prefix || v_year) + 1)::INTEGER
            ELSE 0
        END
    ), 0) + 1 INTO v_sequence
    FROM public.authenticity_certificates;
    
    -- Format: APC2024000001
    v_certificate_number := v_prefix || v_year || LPAD(v_sequence::VARCHAR, 6, '0');
    
    RETURN v_certificate_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate certificate numbers
CREATE OR REPLACE FUNCTION set_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.certificate_number IS NULL OR NEW.certificate_number = '' THEN
        NEW.certificate_number := generate_certificate_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_certificate_number
    BEFORE INSERT ON public.authenticity_certificates
    FOR EACH ROW
    EXECUTE FUNCTION set_certificate_number();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to all tables
CREATE TRIGGER trigger_update_product_quality_scores_updated_at
    BEFORE UPDATE ON public.product_quality_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_plagiarism_checks_updated_at
    BEFORE UPDATE ON public.plagiarism_checks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_authenticity_certificates_updated_at
    BEFORE UPDATE ON public.authenticity_certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_creator_verifications_updated_at
    BEFORE UPDATE ON public.creator_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_creator_badges_updated_at
    BEFORE UPDATE ON public.creator_badges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_quality_check_jobs_updated_at
    BEFORE UPDATE ON public.quality_check_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_trust_metrics_updated_at
    BEFORE UPDATE ON public.trust_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.product_quality_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plagiarism_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authenticity_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_check_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_quality_scores
CREATE POLICY "Users can view quality scores for their products" ON public.product_quality_scores
    FOR SELECT USING (
        product_id IN (
            SELECT id FROM public.products WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view quality scores for published products" ON public.product_quality_scores
    FOR SELECT USING (
        product_id IN (
            SELECT id FROM public.products WHERE status = 'published'
        )
    );

-- RLS Policies for plagiarism_checks
CREATE POLICY "Users can view plagiarism checks for their products" ON public.plagiarism_checks
    FOR SELECT USING (
        product_id IN (
            SELECT id FROM public.products WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for authenticity_certificates
CREATE POLICY "Users can view certificates for their products" ON public.authenticity_certificates
    FOR SELECT USING (
        product_id IN (
            SELECT id FROM public.products WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view certificates for published products" ON public.authenticity_certificates
    FOR SELECT USING (
        product_id IN (
            SELECT id FROM public.products WHERE status = 'published'
        )
    );

-- RLS Policies for creator_verifications
CREATE POLICY "Users can view their own verification" ON public.creator_verifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own verification" ON public.creator_verifications
    FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for creator_badges
CREATE POLICY "Users can view their own badges" ON public.creator_badges
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Public can view active badges for verified users" ON public.creator_badges
    FOR SELECT USING (
        is_active = true AND 
        user_id IN (
            SELECT user_id FROM public.creator_verifications 
            WHERE verification_status = 'verified'
        )
    );

-- RLS Policies for quality_check_jobs
CREATE POLICY "Users can view quality jobs for their products" ON public.quality_check_jobs
    FOR SELECT USING (
        product_id IN (
            SELECT id FROM public.products WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for trust_metrics
CREATE POLICY "Users can view their own trust metrics" ON public.trust_metrics
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Public can view trust metrics for verified creators" ON public.trust_metrics
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM public.creator_verifications 
            WHERE verification_status = 'verified'
        )
    );

-- Insert some default badge types
INSERT INTO public.creator_badges (user_id, badge_type, badge_name, badge_description, badge_color, is_active)
SELECT 
    '00000000-0000-0000-0000-000000000000'::UUID, -- Placeholder user_id
    'creator_verified'::badge_type,
    'Verified Creator',
    'This creator has been verified by our team',
    '#10B981',
    false
WHERE NOT EXISTS (
    SELECT 1 FROM public.creator_badges 
    WHERE badge_type = 'creator_verified' 
    AND user_id = '00000000-0000-0000-0000-000000000000'::UUID
);

-- Add comments for documentation
COMMENT ON TABLE public.product_quality_scores IS 'Stores quality scores for products with multiple quality factors';
COMMENT ON TABLE public.plagiarism_checks IS 'Tracks plagiarism detection results for product content';
COMMENT ON TABLE public.authenticity_certificates IS 'Manages authenticity certificates for verified products';
COMMENT ON TABLE public.creator_verifications IS 'Handles creator verification process and status';
COMMENT ON TABLE public.creator_badges IS 'Manages creator badges and achievements';
COMMENT ON TABLE public.quality_check_jobs IS 'Queue system for async quality checking jobs';
COMMENT ON TABLE public.trust_metrics IS 'Aggregated trust scores and metrics for users';

COMMENT ON FUNCTION calculate_product_quality_score(UUID) IS 'Calculates comprehensive quality score for a product';
COMMENT ON FUNCTION calculate_user_trust_score(UUID) IS 'Calculates trust score for a user based on multiple factors';
COMMENT ON FUNCTION generate_certificate_number() IS 'Generates unique certificate numbers in format APC2024000001';