import { createClient } from '@/lib/supabase/server';
import type {
    EmailCampaign,
    EmailTemplate,
    EmailSubscriber,
    LandingPage,
    LandingPageTemplate,
    Coupon,
    ReferralProgram,
    ReferralLink,
    CreateEmailCampaignData,
    CreateLandingPageData,
    CreateCouponData,
    CreateReferralProgramData,
    EmailCampaignAnalytics,
    LandingPagePerformance,
    ReferralProgramStats,
    PaginatedResponse,
} from '@/types/marketing';

export class MarketingService {
    private supabase;

    constructor() {
        this.supabase = await createClient();
    }

    // Email Marketing Methods
    async createEmailCampaign(userId: string, data: CreateEmailCampaignData): Promise<EmailCampaign> {
        const { data: campaign, error } = await this.supabase
            .from('email_campaigns')
            .insert({
                user_id: userId,
                ...data,
            })
            .select()
            .single();

        if (error) throw error;
        return campaign;
    }

    async getEmailCampaigns(
        userId: string,
        filters: { status?: string; search?: string; page?: number; limit?: number } = {}
    ): Promise<PaginatedResponse<EmailCampaign>> {
        const { page = 1, limit = 20 } = filters;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('email_campaigns')
            .select('*', { count: 'exact' })
            .eq('user_id', userId);

        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return {
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        };
    }

    async getEmailCampaign(userId: string, campaignId: string): Promise<EmailCampaign | null> {
        const { data, error } = await this.supabase
            .from('email_campaigns')
            .select('*')
            .eq('id', campaignId)
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data;
    }

    async updateEmailCampaign(
        userId: string,
        campaignId: string,
        updates: Partial<CreateEmailCampaignData>
    ): Promise<EmailCampaign> {
        const { data, error } = await this.supabase
            .from('email_campaigns')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', campaignId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteEmailCampaign(userId: string, campaignId: string): Promise<void> {
        const { error } = await this.supabase
            .from('email_campaigns')
            .delete()
            .eq('id', campaignId)
            .eq('user_id', userId);

        if (error) throw error;
    }

    // Email Templates
    async getEmailTemplates(): Promise<EmailTemplate[]> {
        const { data, error } = await this.supabase
            .from('email_templates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async createEmailTemplate(userId: string, templateData: any): Promise<EmailTemplate> {
        const { data, error } = await this.supabase
            .from('email_templates')
            .insert({
                ...templateData,
                created_by: userId,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Email Subscribers
    async addEmailSubscriber(userId: string, subscriberData: unknown): Promise<EmailSubscriber> {
        const { data, error } = await this.supabase
            .from('email_subscribers')
            .insert({
                user_id: userId,
                ...subscriberData,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getEmailSubscribers(
        userId: string,
        filters: { status?: string; search?: string; page?: number; limit?: number } = {}
    ): Promise<PaginatedResponse<EmailSubscriber>> {
        const { page = 1, limit = 20 } = filters;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('email_subscribers')
            .select('*', { count: 'exact' })
            .eq('user_id', userId);

        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.search) {
            query = query.or(`email.ilike.%${filters.search}%,name.ilike.%${filters.search}%`);
        }

        const { data, error, count } = await query
            .order('subscribed_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return {
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        };
    }

    // Landing Pages
    async createLandingPage(userId: string, data: CreateLandingPageData): Promise<LandingPage> {
        const { data: page, error } = await this.supabase
            .from('landing_pages')
            .insert({
                user_id: userId,
                ...data,
            })
            .select()
            .single();

        if (error) throw error;
        return page;
    }

    async getLandingPages(
        userId: string,
        filters: { status?: string; search?: string; page?: number; limit?: number } = {}
    ): Promise<PaginatedResponse<LandingPage>> {
        const { page = 1, limit = 20 } = filters;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('landing_pages')
            .select('*', { count: 'exact' })
            .eq('user_id', userId);

        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,title.ilike.%${filters.search}%`);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return {
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        };
    }

    async getLandingPage(userId: string, pageId: string): Promise<LandingPage | null> {
        const { data, error } = await this.supabase
            .from('landing_pages')
            .select('*')
            .eq('id', pageId)
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data;
    }

    async getLandingPageBySlug(slug: string): Promise<LandingPage | null> {
        const { data, error } = await this.supabase
            .from('landing_pages')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (error) throw error;
        return data;
    }

    async updateLandingPage(
        userId: string,
        pageId: string,
        updates: Partial<CreateLandingPageData>
    ): Promise<LandingPage> {
        const { data, error } = await this.supabase
            .from('landing_pages')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', pageId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteLandingPage(userId: string, pageId: string): Promise<void> {
        const { error } = await this.supabase
            .from('landing_pages')
            .delete()
            .eq('id', pageId)
            .eq('user_id', userId);

        if (error) throw error;
    }

    // Landing Page Templates
    async getLandingPageTemplates(): Promise<LandingPageTemplate[]> {
        const { data, error } = await this.supabase
            .from('landing_page_templates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // Coupons
    async createCoupon(userId: string, data: CreateCouponData): Promise<Coupon> {
        const { data: coupon, error } = await this.supabase
            .from('coupons')
            .insert({
                user_id: userId,
                ...data,
            })
            .select()
            .single();

        if (error) throw error;
        return coupon;
    }

    async getCoupons(
        userId: string,
        filters: { status?: string; search?: string; page?: number; limit?: number } = {}
    ): Promise<PaginatedResponse<Coupon>> {
        const { page = 1, limit = 20 } = filters;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('coupons')
            .select('*', { count: 'exact' })
            .eq('user_id', userId);

        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.search) {
            query = query.or(`code.ilike.%${filters.search}%,name.ilike.%${filters.search}%`);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return {
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        };
    }

    async validateCoupon(code: string, cartTotal: number, userId: string): Promise<Coupon | null> {
        const { data, error } = await this.supabase
            .from('coupons')
            .select('*')
            .eq('code', code)
            .eq('status', 'active')
            .single();

        if (error || !data) return null;

        // Check if coupon is valid
        const now = new Date();
        if (data.expires_at && new Date(data.expires_at) < now) return null;
        if (data.starts_at && new Date(data.starts_at) > now) return null;
        if (data.minimum_amount && cartTotal < data.minimum_amount) return null;
        if (data.usage_limit && data.usage_count >= data.usage_limit) return null;

        // Check user usage limit
        const { count } = await this.supabase
            .from('coupon_usage')
            .select('*', { count: 'exact' })
            .eq('coupon_id', data.id)
            .eq('user_id', userId);

        if (count && count >= data.user_usage_limit) return null;

        return data;
    }

    // Referral Programs
    async createReferralProgram(userId: string, data: CreateReferralProgramData): Promise<ReferralProgram> {
        const { data: program, error } = await this.supabase
            .from('referral_programs')
            .insert({
                user_id: userId,
                ...data,
            })
            .select()
            .single();

        if (error) throw error;
        return program;
    }

    async getReferralPrograms(
        userId: string,
        filters: { status?: string; search?: string; page?: number; limit?: number } = {}
    ): Promise<PaginatedResponse<ReferralProgram>> {
        const { page = 1, limit = 20 } = filters;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('referral_programs')
            .select('*', { count: 'exact' })
            .eq('user_id', userId);

        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%`);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return {
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        };
    }

    async createReferralLink(programId: string, referrerId: string): Promise<ReferralLink> {
        // Generate unique referral code
        const referralCode = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const { data, error } = await this.supabase
            .from('referral_links')
            .insert({
                program_id: programId,
                referrer_id: referrerId,
                referral_code: referralCode,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Analytics Methods
    async getEmailCampaignAnalytics(campaignId: string): Promise<EmailCampaignAnalytics> {
        const { data, error } = await this.supabase
            .from('email_campaign_recipients')
            .select('status')
            .eq('campaign_id', campaignId);

        if (error) throw error;

        const stats = data?.reduce((acc, recipient) => {
            acc.total_sent++;
            if (recipient.status === 'delivered') acc.total_delivered++;
            if (recipient.status === 'opened') acc.total_opened++;
            if (recipient.status === 'clicked') acc.total_clicked++;
            if (recipient.status === 'bounced') acc.bounced++;
            return acc;
        }, {
            total_sent: 0,
            total_delivered: 0,
            total_opened: 0,
            total_clicked: 0,
            bounced: 0,
        }) || { total_sent: 0, total_delivered: 0, total_opened: 0, total_clicked: 0, bounced: 0 };

        return {
            campaign_id: campaignId,
            ...stats,
            bounce_rate: stats.total_sent > 0 ? (stats.bounced / stats.total_sent) * 100 : 0,
            open_rate: stats.total_delivered > 0 ? (stats.total_opened / stats.total_delivered) * 100 : 0,
            click_rate: stats.total_opened > 0 ? (stats.total_clicked / stats.total_opened) * 100 : 0,
            unsubscribe_rate: 0, // Would need additional tracking
        };
    }

    async getLandingPagePerformance(pageId: string): Promise<LandingPagePerformance> {
        const { data, error } = await this.supabase
            .from('landing_page_analytics')
            .select('event_type, referrer')
            .eq('landing_page_id', pageId);

        if (error) throw error;

        const stats = data?.reduce((acc, event) => {
            if (event.event_type === 'view') acc.total_views++;
            if (event.event_type === 'conversion') acc.total_conversions++;

            // Track traffic sources
            const source = event.referrer || 'direct';
            acc.traffic_sources[source] = (acc.traffic_sources[source] || 0) + 1;

            return acc;
        }, {
            total_views: 0,
            total_conversions: 0,
            traffic_sources: {} as Record<string, number>,
        }) || { total_views: 0, total_conversions: 0, traffic_sources: {} };

        return {
            page_id: pageId,
            unique_visitors: stats.total_views, // Simplified - would need visitor tracking
            conversion_rate: stats.total_views > 0 ? (stats.total_conversions / stats.total_views) * 100 : 0,
            bounce_rate: 0, // Would need session tracking
            average_time_on_page: 0, // Would need time tracking
            ...stats,
        };
    }
}