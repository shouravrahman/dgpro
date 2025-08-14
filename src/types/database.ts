// Database Types - Generated from Supabase Schema
// This file contains all TypeScript interfaces for database tables

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type ProductStatus = 'draft' | 'published' | 'archived' | 'deleted';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type UserRole = 'user' | 'admin' | 'moderator' | 'super_admin';
export type ListingStatus = 'active' | 'inactive' | 'sold_out' | 'pending_review';
export type AffiliateStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type CompetitionStatus = 'upcoming' | 'active' | 'ended' | 'cancelled';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
export type PricingType = 'free' | 'one_time' | 'subscription' | 'bundle';

// Core User Types
export interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    subscription_tier: SubscriptionTier;
    subscription_expires_at?: string;
    role: UserRole;
    is_verified: boolean;
    total_earnings: number;
    total_spent: number;
    profile_data: Record<string, any>;
    preferences: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface UserProfile {
    id: string;
    user_id: string;
    bio?: string;
    website_url?: string;
    social_links: Record<string, any>;
    skills: string[];
    location?: string;
    timezone?: string;
    portfolio_data: Record<string, any>;
    verification_data: Record<string, any>;
    created_at: string;
    updated_at: string;
}

// Product Types
export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parent_id?: string;
    icon_url?: string;
    color?: string;
    sort_order: number;
    is_active: boolean;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    user_id: string;
    category_id?: string;
    name: string;
    slug: string;
    description?: string;
    short_description?: string;
    content: Record<string, any>;
    pricing_type: PricingType;
    price: number;
    currency: string;
    subscription_interval?: string;
    features: string[];
    tags: string[];
    assets: Record<string, any>;
    metadata: Record<string, any>;
    status: ProductStatus;
    is_featured: boolean;
    view_count: number;
    download_count: number;
    like_count: number;
    quality_score: number;
    seo_title?: string;
    seo_description?: string;
    seo_keywords: string[];
    created_at: string;
    updated_at: string;
    published_at?: string;
}

export interface ScrapedProduct {
    id: string;
    url: string;
    domain?: string;
    title?: string;
    description?: string;
    price?: number;
    currency?: string;
    category?: string;
    images: string[];
    content: Record<string, any>;
    metadata: Record<string, any>;
    analysis_data: Record<string, any>;
    scrape_date: string;
    last_updated: string;
    status: string;
    error_message?: string;
    retry_count: number;
}

// Market Analysis Types
export interface MarketTrend {
    id: string;
    category: string;
    subcategory?: string;
    trend_data: Record<string, any>;
    predictions: Record<string, any>;
    confidence_score: number;
    data_sources: string[];
    analysis_date: string;
    valid_until?: string;
    created_at: string;
    updated_at: string;
}

// Marketplace Types
export interface MarketplaceListing {
    id: string;
    product_id: string;
    seller_id: string;
    price: number;
    original_price?: number;
    discount_percentage: number;
    status: ListingStatus;
    is_featured: boolean;
    featured_until?: string;
    sales_count: number;
    commission_rate: number;
    affiliate_commission_rate: number;
    listing_data: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface ProductBundle {
    id: string;
    name: string;
    slug: string;
    description?: string;
    creator_id: string;
    bundle_price: number;
    original_price?: number;
    discount_percentage: number;
    currency: string;
    status: ListingStatus;
    is_featured: boolean;
    sales_count: number;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface BundleItem {
    id: string;
    bundle_id: string;
    product_id: string;
    sort_order: number;
    created_at: string;
}

// Shopping Cart Types
export interface ShoppingCart {
    id: string;
    user_id?: string;
    session_id?: string;
    total_amount: number;
    currency: string;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
    expires_at: string;
}

export interface CartItem {
    id: string;
    cart_id: string;
    product_id?: string;
    bundle_id?: string;
    quantity: number;
    price: number;
    currency: string;
    created_at: string;
}

// Sales and Affiliate Types
export interface Affiliate {
    id: string;
    user_id: string;
    affiliate_code: string;
    commission_rate: number;
    total_earnings: number;
    total_referrals: number;
    total_sales: number;
    status: AffiliateStatus;
    payment_info: Record<string, any>;
    performance_data: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface SalesTransaction {
    id: string;
    buyer_id: string;
    seller_id: string;
    product_id?: string;
    bundle_id?: string;
    affiliate_id?: string;
    amount: number;
    currency: string;
    platform_fee: number;
    seller_earnings: number;
    affiliate_commission: number;
    payment_status: PaymentStatus;
    payment_method?: string;
    payment_provider_id?: string;
    payment_data: Record<string, any>;
    refund_amount: number;
    refund_reason?: string;
    created_at: string;
    updated_at: string;
    completed_at?: string;
}

export interface AffiliateReferral {
    id: string;
    affiliate_id: string;
    referred_user_id?: string;
    transaction_id?: string;
    referral_code?: string;
    commission_earned: number;
    status: string;
    conversion_data: Record<string, any>;
    created_at: string;
    updated_at: string;
}

// Admin Types
export interface AdminUser {
    id: string;
    user_id: string;
    admin_role: UserRole;
    permissions: Record<string, any>;
    last_login_at?: string;
    login_count: number;
    created_at: string;
    updated_at: string;
}

export interface AuditLog {
    id: string;
    admin_id?: string;
    action: string;
    target_type?: string;
    target_id?: string;
    old_values?: Record<string, any>;
    new_values?: Record<string, any>;
    details: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}

export interface SystemSetting {
    id: string;
    key: string;
    value: Record<string, any>;
    description?: string;
    category: string;
    is_public: boolean;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}

// Content and Community Types
export interface ContentReport {
    id: string;
    reporter_id: string;
    content_type: string;
    content_id: string;
    reason: string;
    description?: string;
    evidence_urls: string[];
    status: ReportStatus;
    priority: number;
    reviewed_by?: string;
    resolution_notes?: string;
    created_at: string;
    updated_at: string;
    resolved_at?: string;
}

export interface ProductReview {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    title?: string;
    content?: string;
    is_verified_purchase: boolean;
    helpful_count: number;
    reported_count: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface ReviewVote {
    id: string;
    review_id: string;
    user_id: string;
    is_helpful: boolean;
    created_at: string;
}

export interface UserFollow {
    id: string;
    follower_id: string;
    following_id: string;
    created_at: string;
}

export interface ProductLike {
    id: string;
    product_id: string;
    user_id: string;
    created_at: string;
}

// Competition Types
export interface AffiliateCompetition {
    id: string;
    name: string;
    description?: string;
    rules: Record<string, any>;
    start_date: string;
    end_date: string;
    prize_pool: number;
    prize_structure: Record<string, any>;
    status: CompetitionStatus;
    participant_count: number;
    total_sales: number;
    metadata: Record<string, any>;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface CompetitionParticipant {
    id: string;
    competition_id: string;
    affiliate_id: string;
    sales_count: number;
    total_revenue: number;
    commission_earned: number;
    rank?: number;
    prize_earned: number;
    performance_data: Record<string, any>;
    joined_at: string;
    updated_at: string;
}

// Marketing Types
export interface Coupon {
    id: string;
    code: string;
    name?: string;
    description?: string;
    discount_type: string;
    discount_value: number;
    minimum_amount: number;
    maximum_discount?: number;
    usage_limit?: number;
    usage_count: number;
    user_limit: number;
    applicable_to: string;
    applicable_ids: string[];
    is_active: boolean;
    starts_at: string;
    expires_at?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface CouponUsage {
    id: string;
    coupon_id: string;
    user_id: string;
    transaction_id?: string;
    discount_amount: number;
    created_at: string;
}

// Communication Types
export interface EmailCampaign {
    id: string;
    name: string;
    subject: string;
    content: string;
    template_data: Record<string, any>;
    target_audience: Record<string, any>;
    status: string;
    scheduled_at?: string;
    sent_at?: string;
    recipient_count: number;
    open_count: number;
    click_count: number;
    unsubscribe_count: number;
    bounce_count: number;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface EmailRecipient {
    id: string;
    campaign_id: string;
    user_id: string;
    email: string;
    status: string;
    sent_at?: string;
    opened_at?: string;
    clicked_at?: string;
    unsubscribed_at?: string;
    bounce_reason?: string;
    created_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message?: string;
    data: Record<string, any>;
    is_read: boolean;
    is_email_sent: boolean;
    priority: number;
    expires_at?: string;
    created_at: string;
    read_at?: string;
}

// File and Integration Types
export interface FileUpload {
    id: string;
    user_id: string;
    filename: string;
    original_filename: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    file_hash?: string;
    is_public: boolean;
    download_count: number;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface ApiKey {
    id: string;
    user_id: string;
    name: string;
    key_hash: string;
    key_prefix: string;
    permissions: Record<string, any>;
    last_used_at?: string;
    usage_count: number;
    rate_limit: number;
    is_active: boolean;
    expires_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Webhook {
    id: string;
    user_id: string;
    name: string;
    url: string;
    events: string[];
    secret?: string;
    is_active: boolean;
    retry_count: number;
    timeout_seconds: number;
    last_triggered_at?: string;
    success_count: number;
    failure_count: number;
    created_at: string;
    updated_at: string;
}

export interface WebhookDelivery {
    id: string;
    webhook_id: string;
    event_type: string;
    payload: Record<string, any>;
    response_status?: number;
    response_body?: string;
    response_time_ms?: number;
    attempt_count: number;
    delivered_at?: string;
    created_at: string;
}

// View Types (for computed data)
export interface ProductStats {
    id: string;
    name: string;
    user_id: string;
    category_id?: string;
    status: ProductStatus;
    price: number;
    view_count: number;
    download_count: number;
    like_count: number;
    quality_score: number;
    sales_count: number;
    avg_rating: number;
    review_count: number;
    created_at: string;
    updated_at: string;
}

export interface UserStats {
    id: string;
    email: string;
    full_name?: string;
    subscription_tier: SubscriptionTier;
    total_earnings: number;
    total_spent: number;
    product_count: number;
    published_count: number;
    follower_count: number;
    following_count: number;
    created_at: string;
}

// Database interface for Supabase
export interface Database {
    public: {
        Tables: {
            users: {
                Row: User;
                Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
            };
            user_profiles: {
                Row: UserProfile;
                Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
            };
            product_categories: {
                Row: ProductCategory;
                Insert: Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>>;
            };
            products: {
                Row: Product;
                Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
            };
            scraped_products: {
                Row: ScrapedProduct;
                Insert: Omit<ScrapedProduct, 'id' | 'scrape_date' | 'last_updated'>;
                Update: Partial<Omit<ScrapedProduct, 'id' | 'scrape_date' | 'last_updated'>>;
            };
            market_trends: {
                Row: MarketTrend;
                Insert: Omit<MarketTrend, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<MarketTrend, 'id' | 'created_at' | 'updated_at'>>;
            };
            marketplace_listings: {
                Row: MarketplaceListing;
                Insert: Omit<MarketplaceListing, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<MarketplaceListing, 'id' | 'created_at' | 'updated_at'>>;
            };
            product_bundles: {
                Row: ProductBundle;
                Insert: Omit<ProductBundle, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<ProductBundle, 'id' | 'created_at' | 'updated_at'>>;
            };
            bundle_items: {
                Row: BundleItem;
                Insert: Omit<BundleItem, 'id' | 'created_at'>;
                Update: Partial<Omit<BundleItem, 'id' | 'created_at'>>;
            };
            shopping_carts: {
                Row: ShoppingCart;
                Insert: Omit<ShoppingCart, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<ShoppingCart, 'id' | 'created_at' | 'updated_at'>>;
            };
            cart_items: {
                Row: CartItem;
                Insert: Omit<CartItem, 'id' | 'created_at'>;
                Update: Partial<Omit<CartItem, 'id' | 'created_at'>>;
            };
            affiliates: {
                Row: Affiliate;
                Insert: Omit<Affiliate, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Affiliate, 'id' | 'created_at' | 'updated_at'>>;
            };
            sales_transactions: {
                Row: SalesTransaction;
                Insert: Omit<SalesTransaction, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<SalesTransaction, 'id' | 'created_at' | 'updated_at'>>;
            };
            affiliate_referrals: {
                Row: AffiliateReferral;
                Insert: Omit<AffiliateReferral, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<AffiliateReferral, 'id' | 'created_at' | 'updated_at'>>;
            };
            // Add other tables as needed...
        };
        Views: {
            product_stats: {
                Row: ProductStats;
            };
            user_stats: {
                Row: UserStats;
            };
        };
        Functions: {
            // Add custom functions as needed
        };
        Enums: {
            subscription_tier: SubscriptionTier;
            product_status: ProductStatus;
            payment_status: PaymentStatus;
            user_role: UserRole;
            listing_status: ListingStatus;
            affiliate_status: AffiliateStatus;
            competition_status: CompetitionStatus;
            report_status: ReportStatus;
            pricing_type: PricingType;
        };
    };
}