-- Seed Data for Development and Testing
-- This migration provides initial data for development and testing purposes

-- Insert default product categories
INSERT INTO public.product_categories (name, slug, description, icon_url, color, sort_order) VALUES
('Digital Templates', 'digital-templates', 'Ready-to-use templates for various purposes', '/icons/templates.svg', '#3B82F6', 1),
('Software & Tools', 'software-tools', 'Applications, plugins, and development tools', '/icons/software.svg', '#10B981', 2),
('Educational Content', 'educational-content', 'Courses, tutorials, and learning materials', '/icons/education.svg', '#F59E0B', 3),
('Design Assets', 'design-assets', 'Graphics, icons, fonts, and design resources', '/icons/design.svg', '#EF4444', 4),
('Business Resources', 'business-resources', 'Business plans, spreadsheets, and productivity tools', '/icons/business.svg', '#8B5CF6', 5),
('Creative Content', 'creative-content', 'Art, music, videos, and creative works', '/icons/creative.svg', '#EC4899', 6);

-- Insert subcategories
INSERT INTO public.product_categories (name, slug, description, parent_id, sort_order) VALUES
('Website Templates', 'website-templates', 'HTML, CSS, and framework templates', 
  (SELECT id FROM public.product_categories WHERE slug = 'digital-templates'), 1),
('Presentation Templates', 'presentation-templates', 'PowerPoint, Keynote, and Google Slides templates',
  (SELECT id FROM public.product_categories WHERE slug = 'digital-templates'), 2),
('Document Templates', 'document-templates', 'Word, PDF, and other document templates',
  (SELECT id FROM public.product_categories WHERE slug = 'digital-templates'), 3),

('Web Applications', 'web-applications', 'Full-stack web applications and SaaS tools',
  (SELECT id FROM public.product_categories WHERE slug = 'software-tools'), 1),
('Mobile Apps', 'mobile-apps', 'iOS and Android applications',
  (SELECT id FROM public.product_categories WHERE slug = 'software-tools'), 2),
('Browser Extensions', 'browser-extensions', 'Chrome, Firefox, and other browser extensions',
  (SELECT id FROM public.product_categories WHERE slug = 'software-tools'), 3),

('Online Courses', 'online-courses', 'Comprehensive video courses and tutorials',
  (SELECT id FROM public.product_categories WHERE slug = 'educational-content'), 1),
('E-books', 'ebooks', 'Digital books and guides',
  (SELECT id FROM public.product_categories WHERE slug = 'educational-content'), 2),
('Worksheets', 'worksheets', 'Printable worksheets and exercises',
  (SELECT id FROM public.product_categories WHERE slug = 'educational-content'), 3);

-- Insert system settings
INSERT INTO public.system_settings (key, value, description, category, is_public) VALUES
('platform_name', '"AI Product Creator"', 'The name of the platform', 'general', true),
('platform_description', '"Discover, analyze, and create digital products with AI"', 'Platform description', 'general', true),
('default_commission_rate', '0.30', 'Default platform commission rate (30%)', 'monetization', false),
('default_affiliate_rate', '0.10', 'Default affiliate commission rate (10%)', 'monetization', false),
('max_file_upload_size', '52428800', 'Maximum file upload size in bytes (50MB)', 'uploads', false),
('allowed_file_types', '["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "zip", "mp4", "mp3"]', 'Allowed file extensions', 'uploads', false),
('free_tier_limits', '{"products": 3, "storage_mb": 100, "api_calls": 100}', 'Free tier limitations', 'subscriptions', false),
('pro_tier_limits', '{"products": 50, "storage_mb": 5000, "api_calls": 5000}', 'Pro tier limitations', 'subscriptions', false),
('enterprise_tier_limits', '{"products": -1, "storage_mb": 50000, "api_calls": 50000}', 'Enterprise tier limitations (-1 = unlimited)', 'subscriptions', false),
('maintenance_mode', 'false', 'Enable maintenance mode', 'system', false),
('registration_enabled', 'true', 'Allow new user registrations', 'system', false);

-- Insert sample coupons for testing
INSERT INTO public.coupons (code, name, description, discount_type, discount_value, minimum_amount, usage_limit, user_limit, is_active, expires_at) VALUES
('WELCOME10', 'Welcome Discount', 'Get 10% off your first purchase', 'percentage', 10.00, 5.00, 1000, 1, true, NOW() + INTERVAL '30 days'),
('SAVE20', 'Save 20%', 'Save 20% on any purchase over $50', 'percentage', 20.00, 50.00, 500, 1, true, NOW() + INTERVAL '60 days'),
('NEWUSER', 'New User Special', 'Get $5 off your first order', 'fixed_amount', 5.00, 10.00, 2000, 1, true, NOW() + INTERVAL '90 days');

-- Function to create sample users (for development only)
CREATE OR REPLACE FUNCTION create_sample_user(
  user_email TEXT,
  user_name TEXT,
  user_tier subscription_tier DEFAULT 'free',
  user_role user_role DEFAULT 'user'
) RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- This would typically be handled by Supabase Auth
  -- This is just for development seeding
  INSERT INTO public.users (id, email, full_name, subscription_tier, role, is_verified)
  VALUES (gen_random_uuid(), user_email, user_name, user_tier, user_role, true)
  RETURNING id INTO new_user_id;
  
  -- Create user profile
  INSERT INTO public.user_profiles (user_id, bio, skills)
  VALUES (
    new_user_id,
    'Sample user profile for ' || user_name,
    ARRAY['Digital Products', 'AI Tools', 'Creative Design']
  );
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create sample admin user (for development)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  admin_user_id := create_sample_user(
    'admin@aiproductcreator.com',
    'Admin User',
    'enterprise',
    'super_admin'
  );
  
  -- Add to admin_users table
  INSERT INTO public.admin_users (user_id, admin_role, permissions)
  VALUES (admin_user_id, 'super_admin', '{"all": true}');
END $$;

-- Create sample regular users (for development)
DO $$
DECLARE
  user1_id UUID;
  user2_id UUID;
  user3_id UUID;
  template_category_id UUID;
  software_category_id UUID;
BEGIN
  user1_id := create_sample_user('creator1@example.com', 'Creative Designer', 'pro');
  user2_id := create_sample_user('developer@example.com', 'Software Developer', 'pro');
  user3_id := create_sample_user('educator@example.com', 'Online Educator', 'free');
  
  -- Get category IDs
  SELECT id INTO template_category_id FROM public.product_categories WHERE slug = 'digital-templates';
  SELECT id INTO software_category_id FROM public.product_categories WHERE slug = 'software-tools';
  
  -- Create sample products
  INSERT INTO public.products (user_id, category_id, name, slug, description, short_description, pricing_type, price, features, tags, status, is_featured) VALUES
  (user1_id, template_category_id, 'Modern Website Template', 'modern-website-template', 
   'A beautiful, responsive website template perfect for creative agencies and portfolios. Built with modern HTML5, CSS3, and JavaScript.',
   'Beautiful responsive website template for creative agencies',
   'one_time', 49.99, 
   ARRAY['Responsive Design', 'Modern UI/UX', 'Cross-browser Compatible', 'SEO Optimized'],
   ARRAY['website', 'template', 'responsive', 'modern'],
   'published', true),
   
  (user1_id, template_category_id, 'Business Presentation Pack', 'business-presentation-pack',
   'Professional presentation templates for business meetings, pitches, and reports. Includes 50+ slides in PowerPoint and Keynote formats.',
   'Professional presentation templates for business',
   'one_time', 29.99,
   ARRAY['50+ Slides', 'PowerPoint & Keynote', 'Professional Design', 'Easy to Customize'],
   ARRAY['presentation', 'business', 'powerpoint', 'keynote'],
   'published', false),
   
  (user2_id, software_category_id, 'Task Management Chrome Extension', 'task-management-extension',
   'A powerful Chrome extension for managing tasks and productivity. Features include task tracking, time management, and team collaboration.',
   'Chrome extension for task management and productivity',
   'one_time', 19.99,
   ARRAY['Task Tracking', 'Time Management', 'Team Collaboration', 'Sync Across Devices'],
   ARRAY['chrome', 'extension', 'productivity', 'tasks'],
   'published', true),
   
  (user3_id, (SELECT id FROM public.product_categories WHERE slug = 'educational-content'), 'Digital Marketing Course', 'digital-marketing-course',
   'Complete digital marketing course covering SEO, social media, email marketing, and analytics. Includes video lessons, worksheets, and templates.',
   'Complete digital marketing course with video lessons',
   'one_time', 99.99,
   ARRAY['20+ Video Lessons', 'Downloadable Resources', 'Certificate of Completion', 'Lifetime Access'],
   ARRAY['course', 'marketing', 'seo', 'social-media'],
   'published', false);
   
  -- Create marketplace listings for published products
  INSERT INTO public.marketplace_listings (product_id, seller_id, price, status, is_featured)
  SELECT p.id, p.user_id, p.price, 'active', p.is_featured
  FROM public.products p
  WHERE p.status = 'published';
  
END $$;

-- Create sample scraped products for testing
INSERT INTO public.scraped_products (url, domain, title, description, price, currency, category, content, analysis_data) VALUES
('https://example.com/product1', 'example.com', 'Premium UI Kit', 'Modern UI components for web applications', 79.99, 'USD', 'Design Assets',
 '{"components": 150, "formats": ["Sketch", "Figma", "Adobe XD"]}',
 '{"market_score": 8.5, "competition_level": "medium", "trend_score": 9.2}'),
 
('https://example.com/product2', 'example.com', 'E-commerce Template', 'Complete e-commerce website template', 129.99, 'USD', 'Website Templates',
 '{"pages": 25, "features": ["Shopping Cart", "Payment Integration", "Admin Panel"]}',
 '{"market_score": 9.1, "competition_level": "high", "trend_score": 8.8}'),
 
('https://example.com/product3', 'example.com', 'Social Media Graphics Pack', 'Instagram and Facebook post templates', 39.99, 'USD', 'Design Assets',
 '{"templates": 100, "formats": ["PSD", "AI", "PNG"]}',
 '{"market_score": 7.8, "competition_level": "high", "trend_score": 8.5}');

-- Create sample market trends
INSERT INTO public.market_trends (category, subcategory, trend_data, predictions, confidence_score, data_sources) VALUES
('Digital Templates', 'Website Templates', 
 '{"growth_rate": 15.2, "demand_score": 8.7, "competition_level": "high", "avg_price": 65.50}',
 '{"6_month_growth": 18.5, "12_month_growth": 25.3, "emerging_niches": ["AI-powered templates", "No-code solutions"]}',
 0.87, ARRAY['Google Trends', 'Market Research', 'Sales Data']),
 
('Software Tools', 'Browser Extensions',
 '{"growth_rate": 22.8, "demand_score": 9.2, "competition_level": "medium", "avg_price": 24.99}',
 '{"6_month_growth": 28.1, "12_month_growth": 35.7, "emerging_niches": ["Privacy tools", "Productivity enhancers"]}',
 0.91, ARRAY['Chrome Web Store', 'Firefox Add-ons', 'User Surveys']),
 
('Educational Content', 'Online Courses',
 '{"growth_rate": 31.5, "demand_score": 9.5, "competition_level": "high", "avg_price": 149.99}',
 '{"6_month_growth": 38.2, "12_month_growth": 45.8, "emerging_niches": ["AI/ML courses", "Remote work skills"]}',
 0.93, ARRAY['Course Platforms', 'Learning Analytics', 'Industry Reports']);

-- Create sample notifications for testing
DO $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM public.users WHERE email = 'creator1@example.com';
  
  IF user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, data, priority) VALUES
    (user_id, 'sale', 'New Sale!', 'Your product "Modern Website Template" was purchased', '{"product_id": "' || (SELECT id FROM public.products WHERE slug = 'modern-website-template') || '", "amount": 49.99}', 2),
    (user_id, 'review', 'New Review', 'Someone left a 5-star review on your product', '{"rating": 5, "product_name": "Modern Website Template"}', 1),
    (user_id, 'system', 'Welcome to AI Product Creator', 'Thank you for joining our platform! Start creating amazing digital products.', '{}', 1);
  END IF;
END $$;

-- Clean up the sample user creation function (not needed in production)
DROP FUNCTION IF EXISTS create_sample_user(TEXT, TEXT, subscription_tier, user_role);

-- Create views for common queries
CREATE OR REPLACE VIEW public.product_stats AS
SELECT 
  p.id,
  p.name,
  p.user_id,
  p.category_id,
  p.status,
  p.price,
  p.view_count,
  p.download_count,
  p.like_count,
  p.quality_score,
  COALESCE(ml.sales_count, 0) as sales_count,
  COALESCE(review_stats.avg_rating, 0) as avg_rating,
  COALESCE(review_stats.review_count, 0) as review_count,
  p.created_at,
  p.updated_at
FROM public.products p
LEFT JOIN public.marketplace_listings ml ON p.id = ml.product_id
LEFT JOIN (
  SELECT 
    product_id,
    AVG(rating::DECIMAL) as avg_rating,
    COUNT(*) as review_count
  FROM public.product_reviews 
  WHERE status = 'published'
  GROUP BY product_id
) review_stats ON p.id = review_stats.product_id;

CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.subscription_tier,
  u.total_earnings,
  u.total_spent,
  COALESCE(product_stats.product_count, 0) as product_count,
  COALESCE(product_stats.published_count, 0) as published_count,
  COALESCE(follower_stats.follower_count, 0) as follower_count,
  COALESCE(following_stats.following_count, 0) as following_count,
  u.created_at
FROM public.users u
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as product_count,
    COUNT(*) FILTER (WHERE status = 'published') as published_count
  FROM public.products
  GROUP BY user_id
) product_stats ON u.id = product_stats.user_id
LEFT JOIN (
  SELECT following_id, COUNT(*) as follower_count
  FROM public.user_follows
  GROUP BY following_id
) follower_stats ON u.id = follower_stats.following_id
LEFT JOIN (
  SELECT follower_id, COUNT(*) as following_count
  FROM public.user_follows
  GROUP BY follower_id
) following_stats ON u.id = following_stats.follower_id;