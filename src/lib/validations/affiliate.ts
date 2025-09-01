import { z } from 'zod';

// Affiliate Registration Schema
export const affiliateRegistrationSchema = z.object({
    commissionRate: z.number().min(0).max(1).optional(),
    payoutMethod: z.enum(['bank_transfer', 'paypal', 'stripe', 'crypto']),
    payoutDetails: z.record(z.any()).optional(),
});

// Affiliate Update Schema
export const affiliateUpdateSchema = z.object({
    commissionRate: z.number().min(0).max(1).optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
    payoutMethod: z.enum(['bank_transfer', 'paypal', 'stripe', 'crypto']).optional(),
    payoutDetails: z.record(z.any()).optional(),
});

// Competition Creation Schema
export const competitionCreateSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(10).max(1000),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    prizePool: z.number().min(0),
    rules: z.record(z.any()).optional(),
});

// Competition Update Schema
export const competitionUpdateSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().min(10).max(1000).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    prizePool: z.number().min(0).optional(),
    status: z.enum(['upcoming', 'active', 'ended', 'cancelled']).optional(),
    rules: z.record(z.any()).optional(),
});

// Referral Tracking Schema
export const referralTrackingSchema = z.object({
    affiliateCode: z.string().min(1),
    productId: z.string().uuid().optional(),
    referrerUrl: z.string().url().optional(),
    landingPage: z.string().url().optional(),
});

// Payout Request Schema
export const payoutRequestSchema = z.object({
    amount: z.number().min(0.01),
    payoutMethod: z.enum(['bank_transfer', 'paypal', 'stripe', 'crypto']),
    payoutDetails: z.record(z.any()),
});

// Query Schemas
export const affiliateQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
    sortBy: z.enum(['earnings', 'referrals', 'created_at']).default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const referralQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    status: z.enum(['pending', 'approved', 'paid', 'cancelled']).optional(),
    affiliateId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sortBy: z.enum(['amount', 'commission', 'created_at']).default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const competitionQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    status: z.enum(['upcoming', 'active', 'ended', 'cancelled']).optional(),
    sortBy: z.enum(['start_date', 'prize_pool', 'created_at']).default('start_date'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const analyticsQuerySchema = z.object({
    period: z.enum(['day', 'week', 'month', 'year']).default('month'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    affiliateId: z.string().uuid().optional(),
});

// Type exports
export type AffiliateRegistrationInput = z.infer<typeof affiliateRegistrationSchema>;
export type AffiliateUpdateInput = z.infer<typeof affiliateUpdateSchema>;
export type CompetitionCreateInput = z.infer<typeof competitionCreateSchema>;
export type CompetitionUpdateInput = z.infer<typeof competitionUpdateSchema>;
export type ReferralTrackingInput = z.infer<typeof referralTrackingSchema>;
export type PayoutRequestInput = z.infer<typeof payoutRequestSchema>;
export type AffiliateQueryInput = z.infer<typeof affiliateQuerySchema>;
export type ReferralQueryInput = z.infer<typeof referralQuerySchema>;
export type CompetitionQueryInput = z.infer<typeof competitionQuerySchema>;
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;