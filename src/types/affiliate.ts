// Affiliate System Types

export interface Affiliate {
    id: string;
    userId: string;
    affiliateCode: string;
    commissionRate: number;
    totalEarnings: number;
    totalReferrals: number;
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    updatedAt: string;
}

export interface AffiliateReferral {
    id: string;
    affiliateId: string;
    referredUserId: string;
    productId?: string;
    saleAmount: number;
    commissionEarned: number;
    status: 'pending' | 'approved' | 'paid' | 'cancelled';
    referralSource?: string;
    createdAt: string;
    updatedAt: string;
    // Relations
    affiliate?: Affiliate;
    referredUser?: {
        id: string;
        email: string;
    };
    product?: {
        id: string;
        name: string;
    };
}

export interface AffiliateCompetition {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    prizePool: number;
    status: 'upcoming' | 'active' | 'ended' | 'cancelled';
    rules: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    participants?: CompetitionParticipant[];
}

export interface CompetitionParticipant {
    id: string;
    competitionId: string;
    affiliateId: string;
    salesCount: number;
    totalRevenue: number;
    rank?: number;
    prizeEarned: number;
    joinedAt: string;
    updatedAt: string;
    // Relations
    affiliate?: Affiliate;
    competition?: AffiliateCompetition;
}

export interface AffiliateClick {
    id: string;
    affiliateId: string;
    productId?: string;
    visitorIp: string;
    userAgent: string;
    referrerUrl?: string;
    landingPage?: string;
    converted: boolean;
    createdAt: string;
}

export interface AffiliatePayout {
    id: string;
    affiliateId: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    payoutMethod: string;
    payoutDetails: Record<string, any>;
    processedAt?: string;
    createdAt: string;
}

// Dashboard and Analytics Types
export interface AffiliateStats {
    totalEarnings: number;
    totalReferrals: number;
    conversionRate: number;
    clickCount: number;
    pendingEarnings: number;
    thisMonthEarnings: number;
    thisMonthReferrals: number;
    topProducts: Array<{
        productId: string;
        productName: string;
        referrals: number;
        earnings: number;
    }>;
}

export interface AffiliatePerformanceMetrics {
    period: 'day' | 'week' | 'month' | 'year';
    data: Array<{
        date: string;
        clicks: number;
        conversions: number;
        earnings: number;
        referrals: number;
    }>;
}

export interface AffiliateLeaderboard {
    affiliateId: string;
    affiliateCode: string;
    userName: string;
    totalEarnings: number;
    totalReferrals: number;
    rank: number;
    badge?: string;
}

// Form Types
export interface AffiliateRegistrationData {
    commissionRate?: number;
    payoutMethod: string;
    payoutDetails: Record<string, any>;
}

export interface CompetitionCreateData {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    prizePool: number;
    rules: Record<string, any>;
}

// API Response Types
export interface AffiliateApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code: string;
    };
}

export interface AffiliateListResponse {
    affiliates: Affiliate[];
    total: number;
    page: number;
    limit: number;
}

export interface ReferralListResponse {
    referrals: AffiliateReferral[];
    total: number;
    page: number;
    limit: number;
}

export interface CompetitionListResponse {
    competitions: AffiliateCompetition[];
    total: number;
    page: number;
    limit: number;
}

// Utility Types
export type AffiliateStatus = Affiliate['status'];
export type ReferralStatus = AffiliateReferral['status'];
export type CompetitionStatus = AffiliateCompetition['status'];
export type PayoutStatus = AffiliatePayout['status'];