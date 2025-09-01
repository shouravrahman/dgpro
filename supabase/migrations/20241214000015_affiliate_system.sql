-- Affiliate System Migration
-- This migration creates the complete affiliate system infrastructure

-- Affiliates Table
CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  affiliate_code VARCHAR UNIQUE NOT NULL,
  commission_rate DECIMAL DEFAULT 0.10,
  total_earnings DECIMAL DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Affiliate Referrals Table
CREATE TABLE affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  sale_amount DECIMAL,
  commission_earned DECIMAL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  referral_source VARCHAR, -- 'link', 'code', 'social', etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Affiliate Competitions Table
CREATE TABLE affiliate_competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  prize_pool DECIMAL DEFAULT 0,
  status VARCHAR DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended', 'cancelled')),
  rules JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Competition Participants Table
CREATE TABLE competition_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES affiliate_competitions(id) ON DELETE CASCADE,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  sales_count INTEGER DEFAULT 0,
  total_revenue DECIMAL DEFAULT 0,
  rank INTEGER,
  prize_earned DECIMAL DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(competition_id, affiliate_id)
);

-- Affiliate Clicks/Visits Tracking Table
CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  visitor_ip INET,
  user_agent TEXT,
  referrer_url TEXT,
  landing_page TEXT,
  converted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Affiliate Payouts Table
CREATE TABLE affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payout_method VARCHAR DEFAULT 'bank_transfer',
  payout_details JSONB DEFAULT '{}',
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX idx_affiliates_status ON affiliates(status);

CREATE INDEX idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX idx_affiliate_referrals_referred_user_id ON affiliate_referrals(referred_user_id);
CREATE INDEX idx_affiliate_referrals_status ON affiliate_referrals(status);
CREATE INDEX idx_affiliate_referrals_created_at ON affiliate_referrals(created_at);

CREATE INDEX idx_competition_participants_competition_id ON competition_participants(competition_id);
CREATE INDEX idx_competition_participants_affiliate_id ON competition_participants(affiliate_id);
CREATE INDEX idx_competition_participants_rank ON competition_participants(rank);

CREATE INDEX idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX idx_affiliate_clicks_created_at ON affiliate_clicks(created_at);
CREATE INDEX idx_affiliate_clicks_converted ON affiliate_clicks(converted);

CREATE INDEX idx_affiliate_payouts_affiliate_id ON affiliate_payouts(affiliate_id);
CREATE INDEX idx_affiliate_payouts_status ON affiliate_payouts(status);

-- RLS Policies
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Affiliates policies
CREATE POLICY "Users can view their own affiliate profile" ON affiliates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate profile" ON affiliates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own affiliate profile" ON affiliates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Affiliate referrals policies
CREATE POLICY "Affiliates can view their own referrals" ON affiliate_referrals
  FOR SELECT USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

-- Competition policies
CREATE POLICY "Anyone can view active competitions" ON affiliate_competitions
  FOR SELECT USING (status = 'active');

CREATE POLICY "Affiliates can view competition participants" ON competition_participants
  FOR SELECT USING (TRUE);

CREATE POLICY "Affiliates can join competitions" ON competition_participants
  FOR INSERT WITH CHECK (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

-- Affiliate clicks policies (for analytics)
CREATE POLICY "Affiliates can view their own click data" ON affiliate_clicks
  FOR SELECT USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

-- Payout policies
CREATE POLICY "Affiliates can view their own payouts" ON affiliate_payouts
  FOR SELECT USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

-- Functions for affiliate system
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM affiliates WHERE affiliate_code = code) INTO exists;
    
    -- If code doesn't exist, return it
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update affiliate earnings
CREATE OR REPLACE FUNCTION update_affiliate_earnings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total earnings and referral count
  UPDATE affiliates 
  SET 
    total_earnings = total_earnings + NEW.commission_earned,
    total_referrals = total_referrals + 1,
    updated_at = NOW()
  WHERE id = NEW.affiliate_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update affiliate earnings when referral is approved
CREATE TRIGGER update_affiliate_earnings_trigger
  AFTER INSERT OR UPDATE ON affiliate_referrals
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION update_affiliate_earnings();

-- Function to update competition rankings
CREATE OR REPLACE FUNCTION update_competition_rankings(comp_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Update rankings based on total revenue
  UPDATE competition_participants 
  SET rank = ranked.new_rank
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY total_revenue DESC, sales_count DESC) as new_rank
    FROM competition_participants 
    WHERE competition_id = comp_id
  ) ranked
  WHERE competition_participants.id = ranked.id
    AND competition_participants.competition_id = comp_id;
END;
$$ LANGUAGE plpgsql;