import { createClient } from '@/lib/supabase/server';
import type {
    Affiliate,
    AffiliateReferral,
    AffiliateCompetition,
    CompetitionParticipant,
    AffiliateStats,
    AffiliatePerformanceMetrics,
    AffiliateLeaderboard,
    AffiliatePayout,
} from '@/types/affiliate';
import type {
    AffiliateRegistrationInput,
    AffiliateUpdateInput,
    CompetitionCreateInput,
    CompetitionUpdateInput,
    PayoutRequestInput,
    AffiliateQueryInput,
    ReferralQueryInput,
    CompetitionQueryInput,
    AnalyticsQueryInput,
} from '@/lib/validations/affiliate';

export class AffiliateService {
    private supabase;

    constructor() {
        this.supabase = createClient();
    }

    // Affiliate Management
    async createAffiliate(userId: string, data: AffiliateRegistrationInput): Promise<Affiliate> {
        // Generate unique affiliate code
        const { data: codeResult } = await this.supabase.rpc('generate_affiliate_code');

        const { data: affiliate, error } = await this.supabase
            .from('affiliates')
            .insert({
                user_id: userId,
                affiliate_code: codeResult,
                commission_rate: data.commissionRate || 0.10,
            })
            .select()
            .single();

        if (error) throw error;
        return this.mapAffiliateFromDb(affiliate);
    }

    async getAffiliate(userId: string): Promise<Affiliate | null> {
        const { data, error } = await this.supabase
            .from('affiliates')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data ? this.mapAffiliateFromDb(data) : null;
    }

    async updateAffiliate(userId: string, data: AffiliateUpdateInput): Promise<Affiliate> {
        const { data: affiliate, error } = await this.supabase
            .from('affiliates')
            .update({
                commission_rate: data.commissionRate,
                status: data.status,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return this.mapAffiliateFromDb(affiliate);
    }

    async getAffiliates(query: AffiliateQueryInput) {
        let queryBuilder = this.supabase
            .from('affiliates')
            .select('*, users!inner(email)', { count: 'exact' });

        if (query.status) {
            queryBuilder = queryBuilder.eq('status', query.status);
        }

        // Sorting
        const sortColumn = query.sortBy === 'earnings' ? 'total_earnings' :
            query.sortBy === 'referrals' ? 'total_referrals' : 'created_at';
        queryBuilder = queryBuilder.order(sortColumn, { ascending: query.sortOrder === 'asc' });

        // Pagination
        const from = (query.page - 1) * query.limit;
        const to = from + query.limit - 1;
        queryBuilder = queryBuilder.range(from, to);

        const { data, error, count } = await queryBuilder;
        if (error) throw error;

        return {
            affiliates: data?.map(this.mapAffiliateFromDb) || [],
            total: count || 0,
            page: query.page,
            limit: query.limit,
        };
    }

    // Referral Management
    async trackReferral(
        affiliateCode: string,
        referredUserId: string,
        productId?: string,
        saleAmount?: number
    ): Promise<AffiliateReferral> {
        // Get affiliate by code
        const { data: affiliate } = await this.supabase
            .from('affiliates')
            .select('id, commission_rate')
            .eq('affiliate_code', affiliateCode)
            .eq('status', 'active')
            .single();

        if (!affiliate) throw new Error('Invalid affiliate code');

        const commissionEarned = saleAmount ? saleAmount * affiliate.commission_rate : 0;

        const { data: referral, error } = await this.supabase
            .from('affiliate_referrals')
            .insert({
                affiliate_id: affiliate.id,
                referred_user_id: referredUserId,
                product_id: productId,
                sale_amount: saleAmount || 0,
                commission_earned: commissionEarned,
                status: saleAmount ? 'approved' : 'pending',
            })
            .select()
            .single();

        if (error) throw error;
        return this.mapReferralFromDb(referral);
    }

    async getReferrals(query: ReferralQueryInput) {
        let queryBuilder = this.supabase
            .from('affiliate_referrals')
            .select(`
        *,
        affiliates!inner(affiliate_code, user_id),
        users!affiliate_referrals_referred_user_id_fkey(email),
        products(name)
      `, { count: 'exact' });

        if (query.status) {
            queryBuilder = queryBuilder.eq('status', query.status);
        }

        if (query.affiliateId) {
            queryBuilder = queryBuilder.eq('affiliate_id', query.affiliateId);
        }

        if (query.startDate) {
            queryBuilder = queryBuilder.gte('created_at', query.startDate);
        }

        if (query.endDate) {
            queryBuilder = queryBuilder.lte('created_at', query.endDate);
        }

        // Sorting
        const sortColumn = query.sortBy === 'amount' ? 'sale_amount' :
            query.sortBy === 'commission' ? 'commission_earned' : 'created_at';
        queryBuilder = queryBuilder.order(sortColumn, { ascending: query.sortOrder === 'asc' });

        // Pagination
        const from = (query.page - 1) * query.limit;
        const to = from + query.limit - 1;
        queryBuilder = queryBuilder.range(from, to);

        const { data, error, count } = await queryBuilder;
        if (error) throw error;

        return {
            referrals: data?.map(this.mapReferralFromDb) || [],
            total: count || 0,
            page: query.page,
            limit: query.limit,
        };
    }

    async approveReferral(referralId: string): Promise<AffiliateReferral> {
        const { data: referral, error } = await this.supabase
            .from('affiliate_referrals')
            .update({
                status: 'approved',
                updated_at: new Date().toISOString(),
            })
            .eq('id', referralId)
            .select()
            .single();

        if (error) throw error;
        return this.mapReferralFromDb(referral);
    }

    // Competition Management
    async createCompetition(data: CompetitionCreateInput): Promise<AffiliateCompetition> {
        const { data: competition, error } = await this.supabase
            .from('affiliate_competitions')
            .insert({
                name: data.name,
                description: data.description,
                start_date: data.startDate,
                end_date: data.endDate,
                prize_pool: data.prizePool,
                rules: data.rules || {},
            })
            .select()
            .single();

        if (error) throw error;
        return this.mapCompetitionFromDb(competition);
    }

    async getCompetitions(query: CompetitionQueryInput) {
        let queryBuilder = this.supabase
            .from('affiliate_competitions')
            .select('*', { count: 'exact' });

        if (query.status) {
            queryBuilder = queryBuilder.eq('status', query.status);
        }

        // Sorting
        queryBuilder = queryBuilder.order(query.sortBy, { ascending: query.sortOrder === 'asc' });

        // Pagination
        const from = (query.page - 1) * query.limit;
        const to = from + query.limit - 1;
        queryBuilder = queryBuilder.range(from, to);

        const { data, error, count } = await queryBuilder;
        if (error) throw error;

        return {
            competitions: data?.map(this.mapCompetitionFromDb) || [],
            total: count || 0,
            page: query.page,
            limit: query.limit,
        };
    }

    async joinCompetition(competitionId: string, affiliateId: string): Promise<CompetitionParticipant> {
        const { data: participant, error } = await this.supabase
            .from('competition_participants')
            .insert({
                competition_id: competitionId,
                affiliate_id: affiliateId,
            })
            .select()
            .single();

        if (error) throw error;
        return this.mapParticipantFromDb(participant);
    }

    async getCompetitionLeaderboard(competitionId: string): Promise<AffiliateLeaderboard[]> {
        const { data, error } = await this.supabase
            .from('competition_participants')
            .select(`
        *,
        affiliates!inner(affiliate_code, users!inner(email))
      `)
            .eq('competition_id', competitionId)
            .order('rank', { ascending: true })
            .limit(100);

        if (error) throw error;

        return data?.map(participant => ({
            affiliateId: participant.affiliate_id,
            affiliateCode: participant.affiliates.affiliate_code,
            userName: participant.affiliates.users.email,
            totalEarnings: participant.total_revenue,
            totalReferrals: participant.sales_count,
            rank: participant.rank || 0,
            badge: this.getBadgeForRank(participant.rank),
        })) || [];
    }

    // Analytics and Stats
    async getAffiliateStats(affiliateId: string): Promise<AffiliateStats> {
        // Get basic stats
        const { data: affiliate } = await this.supabase
            .from('affiliates')
            .select('total_earnings, total_referrals')
            .eq('id', affiliateId)
            .single();

        // Get pending earnings
        const { data: pendingReferrals } = await this.supabase
            .from('affiliate_referrals')
            .select('commission_earned')
            .eq('affiliate_id', affiliateId)
            .eq('status', 'pending');

        const pendingEarnings = pendingReferrals?.reduce((sum, ref) => sum + ref.commission_earned, 0) || 0;

        // Get this month's stats
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: monthlyReferrals } = await this.supabase
            .from('affiliate_referrals')
            .select('commission_earned')
            .eq('affiliate_id', affiliateId)
            .gte('created_at', startOfMonth.toISOString());

        const thisMonthEarnings = monthlyReferrals?.reduce((sum, ref) => sum + ref.commission_earned, 0) || 0;
        const thisMonthReferrals = monthlyReferrals?.length || 0;

        // Get click count
        const { count: clickCount } = await this.supabase
            .from('affiliate_clicks')
            .select('*', { count: 'exact', head: true })
            .eq('affiliate_id', affiliateId);

        // Get conversion rate
        const { count: convertedClicks } = await this.supabase
            .from('affiliate_clicks')
            .select('*', { count: 'exact', head: true })
            .eq('affiliate_id', affiliateId)
            .eq('converted', true);

        const conversionRate = clickCount ? (convertedClicks || 0) / clickCount : 0;

        // Get top products
        const { data: topProducts } = await this.supabase
            .from('affiliate_referrals')
            .select(`
        product_id,
        products!inner(name),
        commission_earned
      `)
            .eq('affiliate_id', affiliateId)
            .not('product_id', 'is', null);

        const productStats = topProducts?.reduce((acc, ref) => {
            const productId = ref.product_id!;
            if (!acc[productId]) {
                acc[productId] = {
                    productId,
                    productName: ref.products.name,
                    referrals: 0,
                    earnings: 0,
                };
            }
            acc[productId].referrals++;
            acc[productId].earnings += ref.commission_earned;
            return acc;
        }, {} as Record<string, any>) || {};

        return {
            totalEarnings: affiliate?.total_earnings || 0,
            totalReferrals: affiliate?.total_referrals || 0,
            conversionRate,
            clickCount: clickCount || 0,
            pendingEarnings,
            thisMonthEarnings,
            thisMonthReferrals,
            topProducts: Object.values(productStats).slice(0, 5),
        };
    }

    async getPerformanceMetrics(
        affiliateId: string,
        query: AnalyticsQueryInput
    ): Promise<AffiliatePerformanceMetrics> {
        const { period, startDate, endDate } = query;

        // Calculate date range
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : this.getStartDateForPeriod(period, end);

        // Get referrals data
        const { data: referrals } = await this.supabase
            .from('affiliate_referrals')
            .select('created_at, commission_earned')
            .eq('affiliate_id', affiliateId)
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString());

        // Get clicks data
        const { data: clicks } = await this.supabase
            .from('affiliate_clicks')
            .select('created_at, converted')
            .eq('affiliate_id', affiliateId)
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString());

        // Group data by period
        const data = this.groupDataByPeriod(referrals || [], clicks || [], period, start, end);

        return { period, data };
    }

    // Payout Management
    async requestPayout(affiliateId: string, data: PayoutRequestInput): Promise<AffiliatePayout> {
        const { data: payout, error } = await this.supabase
            .from('affiliate_payouts')
            .insert({
                affiliate_id: affiliateId,
                amount: data.amount,
                payout_method: data.payoutMethod,
                payout_details: data.payoutDetails,
            })
            .select()
            .single();

        if (error) throw error;
        return this.mapPayoutFromDb(payout);
    }

    async getPayouts(affiliateId: string) {
        const { data, error } = await this.supabase
            .from('affiliate_payouts')
            .select('*')
            .eq('affiliate_id', affiliateId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data?.map(this.mapPayoutFromDb) || [];
    }

    // Helper methods
    private mapAffiliateFromDb(data: any): Affiliate {
        return {
            id: data.id,
            userId: data.user_id,
            affiliateCode: data.affiliate_code,
            commissionRate: data.commission_rate,
            totalEarnings: data.total_earnings,
            totalReferrals: data.total_referrals,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }

    private mapReferralFromDb(data: any): AffiliateReferral {
        return {
            id: data.id,
            affiliateId: data.affiliate_id,
            referredUserId: data.referred_user_id,
            productId: data.product_id,
            saleAmount: data.sale_amount,
            commissionEarned: data.commission_earned,
            status: data.status,
            referralSource: data.referral_source,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }

    private mapCompetitionFromDb(data: any): AffiliateCompetition {
        return {
            id: data.id,
            name: data.name,
            description: data.description,
            startDate: data.start_date,
            endDate: data.end_date,
            prizePool: data.prize_pool,
            status: data.status,
            rules: data.rules,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }

    private mapParticipantFromDb(data: any): CompetitionParticipant {
        return {
            id: data.id,
            competitionId: data.competition_id,
            affiliateId: data.affiliate_id,
            salesCount: data.sales_count,
            totalRevenue: data.total_revenue,
            rank: data.rank,
            prizeEarned: data.prize_earned,
            joinedAt: data.joined_at,
            updatedAt: data.updated_at,
        };
    }

    private mapPayoutFromDb(data: any): AffiliatePayout {
        return {
            id: data.id,
            affiliateId: data.affiliate_id,
            amount: data.amount,
            status: data.status,
            payoutMethod: data.payout_method,
            payoutDetails: data.payout_details,
            processedAt: data.processed_at,
            createdAt: data.created_at,
        };
    }

    private getBadgeForRank(rank?: number): string | undefined {
        if (!rank) return undefined;
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        if (rank <= 10) return '⭐';
        return undefined;
    }

    private getStartDateForPeriod(period: string, end: Date): Date {
        const start = new Date(end);
        switch (period) {
            case 'day':
                start.setDate(start.getDate() - 30);
                break;
            case 'week':
                start.setDate(start.getDate() - 12 * 7);
                break;
            case 'month':
                start.setMonth(start.getMonth() - 12);
                break;
            case 'year':
                start.setFullYear(start.getFullYear() - 5);
                break;
        }
        return start;
    }

    private groupDataByPeriod(
        referrals: any[],
        clicks: any[],
        period: string,
        start: Date,
        end: Date
    ) {
        // Implementation for grouping data by period
        // This would group the data by day/week/month/year based on the period
        // For brevity, returning empty array - full implementation would be more complex
        return [];
    }
}