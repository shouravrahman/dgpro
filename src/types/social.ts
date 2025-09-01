// Social & Community Feature Types

export interface UserProfile {
    id: string;
    user_id: string;
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    website_url: string | null;
    location: string | null;
    skills: string[];
    social_links: Record<string, string>;
    portfolio_showcase: string[]; // Product IDs
    is_verified: boolean;
    reputation_score: number;
    total_followers: number;
    total_following: number;
    created_at: string;
    updated_at: string;
}

export interface UserFollow {
    id: string;
    follower_id: string;
    following_id: string;
    created_at: string;
}

export interface ProductReview {
    id: string;
    product_id: string;
    reviewer_id: string;
    rating: number;
    title: string | null;
    content: string | null;
    is_verified_purchase: boolean;
    helpful_count: number;
    created_at: string;
    updated_at: string;
    // Relations
    reviewer?: UserProfile;
    product?: {
        id: string;
        name: string;
    };
}

export interface ReviewVote {
    id: string;
    review_id: string;
    user_id: string;
    is_helpful: boolean;
    created_at: string;
}

export interface ForumCategory {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    icon: string | null;
    color: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    // Computed fields
    topic_count?: number;
    latest_topic?: ForumTopic;
}

export interface ForumTopic {
    id: string;
    category_id: string;
    author_id: string;
    title: string;
    content: string;
    slug: string;
    is_pinned: boolean;
    is_locked: boolean;
    view_count: number;
    reply_count: number;
    last_reply_at: string;
    last_reply_by: string | null;
    created_at: string;
    updated_at: string;
    // Relations
    category?: ForumCategory;
    author?: UserProfile;
    last_reply_author?: UserProfile;
}

export interface ForumReply {
    id: string;
    topic_id: string;
    author_id: string;
    content: string;
    parent_reply_id: string | null;
    is_solution: boolean;
    like_count: number;
    created_at: string;
    updated_at: string;
    // Relations
    author?: UserProfile;
    parent_reply?: ForumReply;
    replies?: ForumReply[];
}

export interface ForumReplyLike {
    id: string;
    reply_id: string;
    user_id: string;
    created_at: string;
}

export interface Badge {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    criteria: Record<string, any>;
    is_active: boolean;
    created_at: string;
}

export interface UserBadge {
    id: string;
    user_id: string;
    badge_id: string;
    earned_at: string;
    // Relations
    badge?: Badge;
}

export interface ActivityFeedItem {
    id: string;
    user_id: string;
    activity_type: ActivityType;
    target_type: string | null;
    target_id: string | null;
    metadata: Record<string, any>;
    is_public: boolean;
    created_at: string;
    // Relations
    user?: UserProfile;
}

export type ActivityType =
    | 'product_created'
    | 'product_updated'
    | 'review_posted'
    | 'topic_created'
    | 'reply_posted'
    | 'user_followed'
    | 'badge_earned'
    | 'profile_updated';

export interface ModerationReport {
    id: string;
    reporter_id: string;
    content_type: ContentType;
    content_id: string;
    reason: string;
    description: string | null;
    status: ModerationStatus;
    moderator_id: string | null;
    moderator_notes: string | null;
    created_at: string;
    resolved_at: string | null;
    // Relations
    reporter?: UserProfile;
    moderator?: UserProfile;
}

export type ContentType = 'product' | 'review' | 'topic' | 'reply' | 'profile';
export type ModerationStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string | null;
    action_url: string | null;
    is_read: boolean;
    metadata: Record<string, any>;
    created_at: string;
}

export type NotificationType =
    | 'follow'
    | 'review'
    | 'reply'
    | 'mention'
    | 'badge_earned'
    | 'product_featured'
    | 'moderation_action';

// API Response Types
export interface SocialStats {
    total_users: number;
    total_reviews: number;
    total_topics: number;
    total_replies: number;
    average_rating: number;
}

export interface UserStats {
    products_created: number;
    reviews_written: number;
    topics_created: number;
    replies_posted: number;
    badges_earned: number;
    reputation_score: number;
}

// Form Types
export interface CreateReviewData {
    product_id: string;
    rating: number;
    title?: string;
    content?: string;
}

export interface CreateTopicData {
    category_id: string;
    title: string;
    content: string;
}

export interface CreateReplyData {
    topic_id: string;
    content: string;
    parent_reply_id?: string;
}

export interface UpdateProfileData {
    display_name?: string;
    bio?: string;
    website_url?: string;
    location?: string;
    skills?: string[];
    social_links?: Record<string, string>;
    portfolio_showcase?: string[];
}

export interface CreateReportData {
    content_type: ContentType;
    content_id: string;
    reason: string;
    description?: string;
}

// Search and Filter Types
export interface ForumSearchParams {
    category_id?: string;
    query?: string;
    sort?: 'latest' | 'popular' | 'oldest';
    page?: number;
    limit?: number;
}

export interface ReviewSearchParams {
    product_id?: string;
    rating?: number;
    sort?: 'newest' | 'oldest' | 'helpful';
    page?: number;
    limit?: number;
}

export interface UserSearchParams {
    query?: string;
    sort?: 'reputation' | 'followers' | 'newest';
    page?: number;
    limit?: number;
}