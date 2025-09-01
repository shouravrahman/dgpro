// Marketing and Growth Tools Types

export interface EmailCampaign {
    id: string;
    user_id: string;
    name: string;
    subject: string;
    content: string;
    template_id?: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
    scheduled_at?: string;
    sent_at?: string;
    recipient_count: number;
    open_rate: number;
    click_rate: number;
    created_at: string;
    updated_at: string;
}

export interface EmailTemplate {
    id: string;
    name: string;
    description?: string;
    content: string;
    thumbnail_url?: string;
    category: 'welcome' | 'promotional' | 'newsletter' | 'abandoned_cart';
    is_system: boolean;
    created_by?: string;
    created_at: string;
}

export interface EmailSubscriber {
    id: string;
    user_id: string;
    email: string;
    name?: string;
    status: 'active' | 'unsubscribed' | 'bounced';
    tags: string[];
    metadata: Record<string, any>;
    subscribed_at: string;
    unsubscribed_at?: string;
}

export interface EmailCampaignRecipient {
    id: string;
    campaign_id: string;
    subscriber_id: string;
    status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced';
    sent_at?: string;
    opened_at?: string;
    clicked_at?: string;
    bounce_reason?: string;
    created_at: string;
}

export interface LandingPage {
    id: string;
    user_id: string;
    name: string;
    slug: string;
    title: string;
    description?: string;
    content: LandingPageContent;
    template_id?: string;
    seo_meta: SEOMetadata;
    custom_css?: string;
    custom_js?: string;
    status: 'draft' | 'published' | 'archived';
    published_at?: string;
    views_count: number;
    conversions_count: number;
    conversion_rate: number;
    created_at: string;
    updated_at: string;
}

export interface LandingPageContent {
    sections: LandingPageSection[];
    theme?: {
        colors: {
            primary: string;
            secondary: string;
            background: string;
            text: string;
        };
        fonts: {
            heading: string;
            body: string;
        };
    };
}

export interface LandingPageSection {
    id: string;
    type: 'hero' | 'features' | 'testimonials' | 'pricing' | 'cta' | 'form' | 'text' | 'image';
    content: Record<string, any>;
    styles?: Record<string, any>;
    order: number;
}

export interface LandingPageTemplate {
    id: string;
    name: string;
    description?: string;
    thumbnail_url?: string;
    content: LandingPageContent;
    category: 'product' | 'service' | 'event' | 'newsletter';
    is_premium: boolean;
    is_system: boolean;
    created_by?: string;
    created_at: string;
}

export interface LandingPageAnalytics {
    id: string;
    landing_page_id: string;
    visitor_id?: string;
    user_id?: string;
    event_type: 'view' | 'click' | 'conversion' | 'form_submit';
    event_data: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    referrer?: string;
    created_at: string;
}

export interface SEOMetadata {
    title?: string;
    description?: string;
    keywords?: string[];
    og_title?: string;
    og_description?: string;
    og_image?: string;
    twitter_title?: string;
    twitter_description?: string;
    twitter_image?: string;
}

export interface Coupon {
    id: string;
    user_id: string;
    code: string;
    name: string;
    description?: string;
    type: 'percentage' | 'fixed_amount' | 'free_shipping';
    value: number;
    minimum_amount: number;
    maximum_discount?: number;
    usage_limit?: number;
    usage_count: number;
    user_usage_limit: number;
    applicable_products: string[];
    status: 'active' | 'inactive' | 'expired';
    starts_at: string;
    expires_at?: string;
    created_at: string;
    updated_at: string;
}

export interface CouponUsage {
    id: string;
    coupon_id: string;
    user_id: string;
    order_id?: string;
    discount_amount: number;
    used_at: string;
}

export interface ReferralProgram {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    reward_type: 'percentage' | 'fixed_amount' | 'credits';
    reward_value: number;
    referee_reward_type?: 'percentage' | 'fixed_amount' | 'credits';
    referee_reward_value: number;
    minimum_purchase: number;
    maximum_reward?: number;
    status: 'active' | 'inactive' | 'paused';
    terms_conditions?: string;
    created_at: string;
    updated_at: string;
}

export interface ReferralLink {
    id: string;
    program_id: string;
    referrer_id: string;
    referral_code: string;
    clicks_count: number;
    conversions_count: number;
    total_rewards: number;
    status: 'active' | 'inactive' | 'suspended';
    created_at: string;
}

export interface ReferralTracking {
    id: string;
    referral_link_id: string;
    referred_user_id?: string;
    visitor_id?: string;
    event_type: 'click' | 'signup' | 'purchase';
    event_data: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}

export interface ReferralReward {
    id: string;
    program_id: string;
    referrer_id: string;
    referee_id: string;
    referral_link_id?: string;
    reward_type: 'percentage' | 'fixed_amount' | 'credits';
    reward_amount: number;
    status: 'pending' | 'approved' | 'paid' | 'cancelled';
    order_id?: string;
    approved_at?: string;
    paid_at?: string;
    created_at: string;
}

// Form Types
export interface CreateEmailCampaignData {
    name: string;
    subject: string;
    content: string;
    template_id?: string;
    scheduled_at?: string;
}

export interface CreateLandingPageData {
    name: string;
    slug: string;
    title: string;
    description?: string;
    template_id?: string;
    content?: LandingPageContent;
}

export interface CreateCouponData {
    code: string;
    name: string;
    description?: string;
    type: 'percentage' | 'fixed_amount' | 'free_shipping';
    value: number;
    minimum_amount?: number;
    maximum_discount?: number;
    usage_limit?: number;
    user_usage_limit?: number;
    applicable_products?: string[];
    starts_at?: string;
    expires_at?: string;
}

export interface CreateReferralProgramData {
    name: string;
    description?: string;
    reward_type: 'percentage' | 'fixed_amount' | 'credits';
    reward_value: number;
    referee_reward_type?: 'percentage' | 'fixed_amount' | 'credits';
    referee_reward_value?: number;
    minimum_purchase?: number;
    maximum_reward?: number;
    terms_conditions?: string;
}

// Analytics Types
export interface EmailCampaignAnalytics {
    campaign_id: string;
    total_sent: number;
    total_delivered: number;
    total_opened: number;
    total_clicked: number;
    bounce_rate: number;
    open_rate: number;
    click_rate: number;
    unsubscribe_rate: number;
}

export interface LandingPagePerformance {
    page_id: string;
    total_views: number;
    unique_visitors: number;
    total_conversions: number;
    conversion_rate: number;
    bounce_rate: number;
    average_time_on_page: number;
    traffic_sources: Record<string, number>;
}

export interface ReferralProgramStats {
    program_id: string;
    total_referrers: number;
    total_referrals: number;
    total_conversions: number;
    total_rewards_paid: number;
    conversion_rate: number;
    average_reward_per_referral: number;
}

// API Response Types
export interface MarketingAPIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code: string;
        details?: any;
    };
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}