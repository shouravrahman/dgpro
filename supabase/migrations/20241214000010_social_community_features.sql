-- Social & Community Features Migration
-- Requirements: 12.1, 12.2, 12.3, 12.4

-- User Profiles with Portfolio Showcase
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  website_url TEXT,
  location VARCHAR(100),
  skills JSONB DEFAULT '[]'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb, -- {twitter, linkedin, github, etc}
  portfolio_showcase JSONB DEFAULT '[]'::jsonb, -- Array of featured product IDs
  is_verified BOOLEAN DEFAULT FALSE,
  reputation_score INTEGER DEFAULT 0,
  total_followers INTEGER DEFAULT 0,
  total_following INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Following System
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Product Reviews and Ratings
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, reviewer_id)
);

-- Review Helpfulness Votes
CREATE TABLE review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Community Forums
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7), -- Hex color
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMP DEFAULT NOW(),
  last_reply_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_reply_id UUID REFERENCES forum_replies(id), -- For nested replies
  is_solution BOOLEAN DEFAULT FALSE, -- Mark as solution to topic
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Forum Reply Likes
CREATE TABLE forum_reply_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(reply_id, user_id)
);

-- User Badges and Achievements
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(7),
  criteria JSONB, -- Conditions for earning the badge
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Social Activity Feed
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'product_created', 'review_posted', 'topic_created', etc.
  target_type VARCHAR(50), -- 'product', 'review', 'topic', 'user'
  target_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Content Moderation
CREATE TABLE moderation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL, -- 'product', 'review', 'topic', 'reply', 'profile'
  content_id UUID NOT NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  moderator_id UUID REFERENCES auth.users(id),
  moderator_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- User Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'follow', 'review', 'reply', 'mention', etc.
  title VARCHAR(200) NOT NULL,
  message TEXT,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_reputation ON user_profiles(reputation_score DESC);
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
CREATE INDEX idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_reviewer ON product_reviews(reviewer_id);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating DESC);
CREATE INDEX idx_forum_topics_category ON forum_topics(category_id);
CREATE INDEX idx_forum_topics_author ON forum_topics(author_id);
CREATE INDEX idx_forum_topics_last_reply ON forum_topics(last_reply_at DESC);
CREATE INDEX idx_forum_replies_topic ON forum_replies(topic_id);
CREATE INDEX idx_forum_replies_author ON forum_replies(author_id);
CREATE INDEX idx_activity_feed_user ON activity_feed(user_id);
CREATE INDEX idx_activity_feed_created ON activity_feed(created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Functions to update counters
CREATE OR REPLACE FUNCTION update_user_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update follower count for the user being followed
    UPDATE user_profiles 
    SET total_followers = total_followers + 1 
    WHERE user_id = NEW.following_id;
    
    -- Update following count for the follower
    UPDATE user_profiles 
    SET total_following = total_following + 1 
    WHERE user_id = NEW.follower_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update follower count for the user being unfollowed
    UPDATE user_profiles 
    SET total_followers = total_followers - 1 
    WHERE user_id = OLD.following_id;
    
    -- Update following count for the unfollower
    UPDATE user_profiles 
    SET total_following = total_following - 1 
    WHERE user_id = OLD.follower_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_follow_counts
  AFTER INSERT OR DELETE ON user_follows
  FOR EACH ROW EXECUTE FUNCTION update_user_follow_counts();

-- Function to update forum reply counts
CREATE OR REPLACE FUNCTION update_forum_reply_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_topics 
    SET reply_count = reply_count + 1,
        last_reply_at = NEW.created_at,
        last_reply_by = NEW.author_id
    WHERE id = NEW.topic_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_topics 
    SET reply_count = reply_count - 1
    WHERE id = OLD.topic_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reply_counts
  AFTER INSERT OR DELETE ON forum_replies
  FOR EACH ROW EXECUTE FUNCTION update_forum_reply_counts();

-- Function to update review helpfulness counts
CREATE OR REPLACE FUNCTION update_review_helpful_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_helpful THEN
      UPDATE product_reviews 
      SET helpful_count = helpful_count + 1 
      WHERE id = NEW.review_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_helpful != NEW.is_helpful THEN
      IF NEW.is_helpful THEN
        UPDATE product_reviews 
        SET helpful_count = helpful_count + 1 
        WHERE id = NEW.review_id;
      ELSE
        UPDATE product_reviews 
        SET helpful_count = helpful_count - 1 
        WHERE id = NEW.review_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_helpful THEN
      UPDATE product_reviews 
      SET helpful_count = helpful_count - 1 
      WHERE id = OLD.review_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_helpful_counts
  AFTER INSERT OR UPDATE OR DELETE ON review_votes
  FOR EACH ROW EXECUTE FUNCTION update_review_helpful_counts();

-- Function to update forum reply like counts
CREATE OR REPLACE FUNCTION update_reply_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_replies 
    SET like_count = like_count + 1 
    WHERE id = NEW.reply_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_replies 
    SET like_count = like_count - 1 
    WHERE id = OLD.reply_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_like_counts
  AFTER INSERT OR DELETE ON forum_reply_likes
  FOR EACH ROW EXECUTE FUNCTION update_reply_like_counts();

-- Insert default forum categories
INSERT INTO forum_categories (name, description, slug, icon, color, sort_order) VALUES
('General Discussion', 'General topics about digital products and entrepreneurship', 'general', 'MessageCircle', '#3B82F6', 1),
('Product Showcase', 'Share and discuss your digital products', 'showcase', 'Star', '#10B981', 2),
('Market Trends', 'Discuss market trends and opportunities', 'trends', 'TrendingUp', '#F59E0B', 3),
('AI & Automation', 'Topics about AI tools and automation', 'ai-automation', 'Bot', '#8B5CF6', 4),
('Success Stories', 'Share your success stories and case studies', 'success', 'Trophy', '#EF4444', 5),
('Help & Support', 'Get help with the platform and tools', 'support', 'HelpCircle', '#6B7280', 6);

-- Insert default badges
INSERT INTO badges (name, description, icon, color, criteria) VALUES
('Welcome', 'Completed profile setup', 'UserCheck', '#3B82F6', '{"type": "profile_complete"}'),
('First Product', 'Created your first product', 'Package', '#10B981', '{"type": "product_created", "count": 1}'),
('Productive Creator', 'Created 10 products', 'Zap', '#F59E0B', '{"type": "product_created", "count": 10}'),
('Community Helper', 'Received 50 helpful votes on reviews', 'Heart', '#EF4444', '{"type": "helpful_votes", "count": 50}'),
('Popular Creator', 'Gained 100 followers', 'Users', '#8B5CF6', '{"type": "followers", "count": 100}'),
('Forum Contributor', 'Posted 25 forum replies', 'MessageSquare', '#06B6D4', '{"type": "forum_replies", "count": 25}'),
('Verified Creator', 'Verified account with quality products', 'CheckCircle', '#10B981', '{"type": "verified"}');