import { z } from 'zod';

// Email Campaign Validations
export const createEmailCampaignSchema = z.object({
    name: z.string().min(1, 'Campaign name is required').max(100, 'Name too long'),
    subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
    content: z.string().min(1, 'Content is required'),
    template_id: z.string().uuid().optional(),
    scheduled_at: z.string().datetime().optional(),
});

export const updateEmailCampaignSchema = createEmailCampaignSchema.partial();

export const emailSubscriberSchema = z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().optional(),
    tags: z.array(z.string()).default([]),
    metadata: z.record(z.any()).default({}),
});

export const bulkEmailSubscribersSchema = z.object({
    subscribers: z.array(emailSubscriberSchema).min(1, 'At least one subscriber required'),
});

// Landing Page Validations
export const landingPageSectionSchema = z.object({
    id: z.string(),
    type: z.enum(['hero', 'features', 'testimonials', 'pricing', 'cta', 'form', 'text', 'image']),
    content: z.record(z.any()),
    styles: z.record(z.any()).optional(),
    order: z.number().int().min(0),
});

export const landingPageContentSchema = z.object({
    sections: z.array(landingPageSectionSchema),
    theme: z.object({
        colors: z.object({
            primary: z.string(),
            secondary: z.string(),
            background: z.string(),
            text: z.string(),
        }),
        fonts: z.object({
            heading: z.string(),
            body: z.string(),
        }),
    }).optional(),
});

export const seoMetadataSchema = z.object({
    title: z.string().max(60).optional(),
    description: z.string().max(160).optional(),
    keywords: z.array(z.string()).optional(),
    og_title: z.string().max(60).optional(),
    og_description: z.string().max(160).optional(),
    og_image: z.string().url().optional(),
    twitter_title: z.string().max(60).optional(),
    twitter_description: z.string().max(160).optional(),
    twitter_image: z.string().url().optional(),
});

export const createLandingPageSchema = z.object({
    name: z.string().min(1, 'Page name is required').max(100, 'Name too long'),
    slug: z.string()
        .min(1, 'Slug is required')
        .max(100, 'Slug too long')
        .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
    title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
    description: z.string().max(500, 'Description too long').optional(),
    template_id: z.string().uuid().optional(),
    content: landingPageContentSchema.optional(),
    seo_meta: seoMetadataSchema.default({}),
    custom_css: z.string().optional(),
    custom_js: z.string().optional(),
});

export const updateLandingPageSchema = createLandingPageSchema.partial();

// Coupon Validations
export const createCouponSchema = z.object({
    code: z.string()
        .min(3, 'Code must be at least 3 characters')
        .max(20, 'Code too long')
        .regex(/^[A-Z0-9-_]+$/, 'Code can only contain uppercase letters, numbers, hyphens, and underscores'),
    name: z.string().min(1, 'Coupon name is required').max(100, 'Name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    type: z.enum(['percentage', 'fixed_amount', 'free_shipping']),
    value: z.number().positive('Value must be positive'),
    minimum_amount: z.number().min(0, 'Minimum amount cannot be negative').default(0),
    maximum_discount: z.number().positive().optional(),
    usage_limit: z.number().int().positive().optional(),
    user_usage_limit: z.number().int().positive().default(1),
    applicable_products: z.array(z.string().uuid()).default([]),
    starts_at: z.string().datetime().optional(),
    expires_at: z.string().datetime().optional(),
}).refine((data) => {
    if (data.type === 'percentage' && data.value > 100) {
        return false;
    }
    return true;
}, {
    message: 'Percentage discount cannot exceed 100%',
    path: ['value'],
}).refine((data) => {
    if (data.starts_at && data.expires_at) {
        return new Date(data.starts_at) < new Date(data.expires_at);
    }
    return true;
}, {
    message: 'Start date must be before expiry date',
    path: ['expires_at'],
});

export const updateCouponSchema = createCouponSchema.partial();

export const validateCouponSchema = z.object({
    code: z.string().min(1, 'Coupon code is required'),
    cart_total: z.number().min(0, 'Cart total must be non-negative'),
    user_id: z.string().uuid(),
    product_ids: z.array(z.string().uuid()).default([]),
});

// Referral Program Validations
export const createReferralProgramSchema = z.object({
    name: z.string().min(1, 'Program name is required').max(100, 'Name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    reward_type: z.enum(['percentage', 'fixed_amount', 'credits']),
    reward_value: z.number().positive('Reward value must be positive'),
    referee_reward_type: z.enum(['percentage', 'fixed_amount', 'credits']).optional(),
    referee_reward_value: z.number().min(0, 'Referee reward cannot be negative').default(0),
    minimum_purchase: z.number().min(0, 'Minimum purchase cannot be negative').default(0),
    maximum_reward: z.number().positive().optional(),
    terms_conditions: z.string().optional(),
}).refine((data) => {
    if (data.reward_type === 'percentage' && data.reward_value > 100) {
        return false;
    }
    return true;
}, {
    message: 'Percentage reward cannot exceed 100%',
    path: ['reward_value'],
}).refine((data) => {
    if (data.referee_reward_type === 'percentage' && data.referee_reward_value > 100) {
        return false;
    }
    return true;
}, {
    message: 'Percentage referee reward cannot exceed 100%',
    path: ['referee_reward_value'],
});

export const updateReferralProgramSchema = createReferralProgramSchema.partial();

export const trackReferralSchema = z.object({
    referral_code: z.string().min(1, 'Referral code is required'),
    event_type: z.enum(['click', 'signup', 'purchase']),
    event_data: z.record(z.any()).default({}),
    visitor_id: z.string().optional(),
    user_id: z.string().uuid().optional(),
});

// Analytics Validations
export const analyticsDateRangeSchema = z.object({
    start_date: z.string().datetime(),
    end_date: z.string().datetime(),
}).refine((data) => {
    return new Date(data.start_date) < new Date(data.end_date);
}, {
    message: 'Start date must be before end date',
    path: ['end_date'],
});

export const landingPageAnalyticsSchema = z.object({
    landing_page_id: z.string().uuid(),
    visitor_id: z.string().optional(),
    event_type: z.enum(['view', 'click', 'conversion', 'form_submit']),
    event_data: z.record(z.any()).default({}),
});

// Email Template Validations
export const createEmailTemplateSchema = z.object({
    name: z.string().min(1, 'Template name is required').max(100, 'Name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    content: z.string().min(1, 'Template content is required'),
    category: z.enum(['welcome', 'promotional', 'newsletter', 'abandoned_cart']),
    thumbnail_url: z.string().url().optional(),
});

export const updateEmailTemplateSchema = createEmailTemplateSchema.partial();

// Landing Page Template Validations
export const createLandingPageTemplateSchema = z.object({
    name: z.string().min(1, 'Template name is required').max(100, 'Name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    content: landingPageContentSchema,
    category: z.enum(['product', 'service', 'event', 'newsletter']),
    thumbnail_url: z.string().url().optional(),
    is_premium: z.boolean().default(false),
});

export const updateLandingPageTemplateSchema = createLandingPageTemplateSchema.partial();

// Pagination Schema
export const paginationSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    sort_by: z.string().optional(),
    sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// Search and Filter Schemas
export const emailCampaignFiltersSchema = z.object({
    status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'paused']).optional(),
    search: z.string().optional(),
}).merge(paginationSchema);

export const landingPageFiltersSchema = z.object({
    status: z.enum(['draft', 'published', 'archived']).optional(),
    search: z.string().optional(),
}).merge(paginationSchema);

export const couponFiltersSchema = z.object({
    status: z.enum(['active', 'inactive', 'expired']).optional(),
    type: z.enum(['percentage', 'fixed_amount', 'free_shipping']).optional(),
    search: z.string().optional(),
}).merge(paginationSchema);

export const referralProgramFiltersSchema = z.object({
    status: z.enum(['active', 'inactive', 'paused']).optional(),
    search: z.string().optional(),
}).merge(paginationSchema);

// Export all schemas as a group for easier imports
export const marketingValidations = {
    // Email Marketing
    createEmailCampaign: createEmailCampaignSchema,
    updateEmailCampaign: updateEmailCampaignSchema,
    emailSubscriber: emailSubscriberSchema,
    bulkEmailSubscribers: bulkEmailSubscribersSchema,
    createEmailTemplate: createEmailTemplateSchema,
    updateEmailTemplate: updateEmailTemplateSchema,

    // Landing Pages
    createLandingPage: createLandingPageSchema,
    updateLandingPage: updateLandingPageSchema,
    createLandingPageTemplate: createLandingPageTemplateSchema,
    updateLandingPageTemplate: updateLandingPageTemplateSchema,
    landingPageAnalytics: landingPageAnalyticsSchema,

    // Coupons
    createCoupon: createCouponSchema,
    updateCoupon: updateCouponSchema,
    validateCoupon: validateCouponSchema,

    // Referral Programs
    createReferralProgram: createReferralProgramSchema,
    updateReferralProgram: updateReferralProgramSchema,
    trackReferral: trackReferralSchema,

    // Analytics
    analyticsDateRange: analyticsDateRangeSchema,

    // Filters
    emailCampaignFilters: emailCampaignFiltersSchema,
    landingPageFilters: landingPageFiltersSchema,
    couponFilters: couponFiltersSchema,
    referralProgramFilters: referralProgramFiltersSchema,
};