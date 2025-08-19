-- User Onboarding and Role System Migration
-- This migration adds user roles, onboarding data, and preferences

-- Add role and onboarding columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'creator' CHECK (role IN ('creator', 'buyer'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_level VARCHAR CHECK (experience_level IN ('beginner', 'intermediate', 'expert'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_goal VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS budget_range VARCHAR;

-- Create user_onboarding_progress table for detailed tracking
CREATE TABLE IF NOT EXISTS user_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  step_name VARCHAR NOT NULL,
  step_number INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_achievements table for gamification
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR NOT NULL,
  achievement_name VARCHAR NOT NULL,
  description TEXT,
  earned_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create user_preferences table for detailed preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR NOT NULL,
  preference_key VARCHAR NOT NULL,
  preference_value JSONB,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, category, preference_key)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_progress_user_id ON user_onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- RLS Policies for new tables
ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only access their own onboarding progress
CREATE POLICY "Users can view own onboarding progress" ON user_onboarding_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding progress" ON user_onboarding_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding progress" ON user_onboarding_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only access their own achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements" ON user_achievements
  FOR INSERT WITH CHECK (true); -- System can award achievements

-- Users can only access their own preferences
CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Function to complete onboarding step
CREATE OR REPLACE FUNCTION complete_onboarding_step(
  step_name VARCHAR,
  step_number INTEGER,
  step_data JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert onboarding progress
  INSERT INTO user_onboarding_progress (user_id, step_name, step_number, data)
  VALUES (auth.uid(), step_name, step_number, step_data);
  
  -- Update user's current onboarding step
  UPDATE users 
  SET onboarding_step = GREATEST(onboarding_step, step_number),
      updated_at = NOW()
  WHERE id = auth.uid();
  
  -- If this is the final step, mark onboarding as completed
  IF step_number >= 3 THEN
    UPDATE users 
    SET onboarding_completed = TRUE,
        updated_at = NOW()
    WHERE id = auth.uid();
    
    -- Award onboarding completion achievement
    INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description)
    VALUES (
      auth.uid(), 
      'onboarding', 
      'Welcome Aboard!', 
      'Completed the onboarding process'
    );
  END IF;
END;
$$;

-- Function to update user preferences
CREATE OR REPLACE FUNCTION update_user_preference(
  category VARCHAR,
  preference_key VARCHAR,
  preference_value JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_preferences (user_id, category, preference_key, preference_value)
  VALUES (auth.uid(), category, preference_key, preference_value)
  ON CONFLICT (user_id, category, preference_key)
  DO UPDATE SET 
    preference_value = EXCLUDED.preference_value,
    updated_at = NOW();
END;
$$;

-- Function to get user onboarding status
CREATE OR REPLACE FUNCTION get_user_onboarding_status()
RETURNS TABLE (
  user_id UUID,
  role VARCHAR,
  onboarding_completed BOOLEAN,
  current_step INTEGER,
  experience_level VARCHAR,
  interests JSONB,
  preferences JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.role,
    u.onboarding_completed,
    u.onboarding_step,
    u.experience_level,
    u.interests,
    u.preferences
  FROM users u
  WHERE u.id = auth.uid();
END;
$$;