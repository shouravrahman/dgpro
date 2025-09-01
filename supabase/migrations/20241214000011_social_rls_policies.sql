-- Row Level Security Policies for Social & Community Features

-- Enable RLS on all social tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reply_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- User Follows Policies
CREATE POLICY "Follows are viewable by everyone" ON user_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON user_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Product Reviews Policies
CREATE POLICY "Reviews are viewable by everyone" ON product_reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON product_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" ON product_reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews" ON product_reviews
  FOR DELETE USING (auth.uid() = reviewer_id);

-- Review Votes Policies
CREATE POLICY "Review votes are viewable by everyone" ON review_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote on reviews" ON review_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON review_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON review_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Forum Categories Policies
CREATE POLICY "Forum categories are viewable by everyone" ON forum_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage forum categories" ON forum_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );

-- Forum Topics Policies
CREATE POLICY "Forum topics are viewable by everyone" ON forum_topics
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create topics" ON forum_topics
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own topics" ON forum_topics
  FOR UPDATE USING (
    auth.uid() = author_id OR 
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'moderator')
    )
  );

CREATE POLICY "Users can delete their own topics or admins can delete any" ON forum_topics
  FOR DELETE USING (
    auth.uid() = author_id OR 
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'moderator')
    )
  );

-- Forum Replies Policies
CREATE POLICY "Forum replies are viewable by everyone" ON forum_replies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create replies" ON forum_replies
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own replies" ON forum_replies
  FOR UPDATE USING (
    auth.uid() = author_id OR 
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'moderator')
    )
  );

CREATE POLICY "Users can delete their own replies or admins can delete any" ON forum_replies
  FOR DELETE USING (
    auth.uid() = author_id OR 
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'moderator')
    )
  );

-- Forum Reply Likes Policies
CREATE POLICY "Reply likes are viewable by everyone" ON forum_reply_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like replies" ON forum_reply_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike replies" ON forum_reply_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Badges Policies
CREATE POLICY "Badges are viewable by everyone" ON badges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage badges" ON badges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );

-- User Badges Policies
CREATE POLICY "User badges are viewable by everyone" ON user_badges
  FOR SELECT USING (true);

CREATE POLICY "Only system can award badges" ON user_badges
  FOR INSERT WITH CHECK (false); -- Only through functions

CREATE POLICY "Only admins can remove badges" ON user_badges
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );

-- Activity Feed Policies
CREATE POLICY "Public activities are viewable by everyone" ON activity_feed
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own activities" ON activity_feed
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System creates activity entries" ON activity_feed
  FOR INSERT WITH CHECK (false); -- Only through functions

-- Moderation Reports Policies
CREATE POLICY "Users can view their own reports" ON moderation_reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Moderators can view all reports" ON moderation_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'moderator')
    )
  );

CREATE POLICY "Authenticated users can create reports" ON moderation_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Moderators can update reports" ON moderation_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'moderator')
    )
  );

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "System creates notifications" ON notifications
  FOR INSERT WITH CHECK (false); -- Only through functions