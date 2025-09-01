'use client';

import { useState, useEffect } from 'react';
import type {
    EmailCampaign,
    EmailTemplate,
    EmailSubscriber,
    LandingPage,
    Coupon,
    ReferralProgram,
    CreateEmailCampaignData,
    CreateLandingPageData,
    CreateCouponData,
    CreateReferralProgramData,
    PaginatedResponse,
} from '@/types/marketing';

interface UseMarketingReturn {
    // Email Campaigns
    emailCampaigns: EmailCampaign[];
    emailTemplates: EmailTemplate[];
    emailSubscribers: EmailSubscriber[];

    // Landing Pages
    landingPages: LandingPage[];

    // Coupons
    coupons: Coupon[];

    // Referral Programs
    referralPrograms: ReferralProgram[];

    // Loading states
    isLoading: boolean;
    isCreating: boolean;

    // Actions
    createEmailCampaign: (data: CreateEmailCampaignData) => Promise<EmailCampaign | null>;
    updateEmailCampaign: (id: string, data: Partial<CreateEmailCampaignData>) => Promise<EmailCampaign | null>;
    deleteEmailCampaign: (id: string) => Promise<boolean>;

    createLandingPage: (data: CreateLandingPageData) => Promise<LandingPage | null>;
    updateLandingPage: (id: string, data: Partial<CreateLandingPageData>) => Promise<LandingPage | null>;
    deleteLandingPage: (id: string) => Promise<boolean>;

    createCoupon: (data: CreateCouponData) => Promise<Coupon | null>;
    validateCoupon: (code: string, cartTotal: number, productIds?: string[]) => Promise<any>;

    createReferralProgram: (data: CreateReferralProgramData) => Promise<ReferralProgram | null>;

    // Refresh functions
    refreshEmailCampaigns: () => Promise<void>;
    refreshLandingPages: () => Promise<void>;
    refreshCoupons: () => Promise<void>;
    refreshReferralPrograms: () => Promise<void>;
}

export function useMarketing(): UseMarketingReturn {
    const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
    const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
    const [emailSubscribers, setEmailSubscribers] = useState<EmailSubscriber[]>([]);
    const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [referralPrograms, setReferralPrograms] = useState<ReferralProgram[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([
                    refreshEmailCampaigns(),
                    refreshLandingPages(),
                    refreshCoupons(),
                    refreshReferralPrograms(),
                    fetchEmailTemplates(),
                ]);
            } catch (error) {
                console.error('Error fetching initial marketing data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Email Campaigns
    const refreshEmailCampaigns = async () => {
        try {
            const response = await fetch('/api/marketing/email-campaigns');
            const result = await response.json();
            if (result.success) {
                setEmailCampaigns(result.data.data);
            }
        } catch (error) {
            console.error('Error fetching email campaigns:', error);
        }
    };

    const createEmailCampaign = async (data: CreateEmailCampaignData): Promise<EmailCampaign | null> => {
        setIsCreating(true);
        try {
            const response = await fetch('/api/marketing/email-campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (result.success) {
                setEmailCampaigns(prev => [result.data, ...prev]);
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Error creating email campaign:', error);
            return null;
        } finally {
            setIsCreating(false);
        }
    };

    const updateEmailCampaign = async (
        id: string,
        data: Partial<CreateEmailCampaignData>
    ): Promise<EmailCampaign | null> => {
        try {
            const response = await fetch(`/api/marketing/email-campaigns/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (result.success) {
                setEmailCampaigns(prev =>
                    prev.map(campaign => campaign.id === id ? result.data : campaign)
                );
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Error updating email campaign:', error);
            return null;
        }
    };

    const deleteEmailCampaign = async (id: string): Promise<boolean> => {
        try {
            const response = await fetch(`/api/marketing/email-campaigns/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();
            if (result.success) {
                setEmailCampaigns(prev => prev.filter(campaign => campaign.id !== id));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting email campaign:', error);
            return false;
        }
    };

    // Email Templates
    const fetchEmailTemplates = async () => {
        try {
            const response = await fetch('/api/marketing/email-templates');
            const result = await response.json();
            if (result.success) {
                setEmailTemplates(result.data);
            }
        } catch (error) {
            console.error('Error fetching email templates:', error);
        }
    };

    // Landing Pages
    const refreshLandingPages = async () => {
        try {
            const response = await fetch('/api/marketing/landing-pages');
            const result = await response.json();
            if (result.success) {
                setLandingPages(result.data.data);
            }
        } catch (error) {
            console.error('Error fetching landing pages:', error);
        }
    };

    const createLandingPage = async (data: CreateLandingPageData): Promise<LandingPage | null> => {
        setIsCreating(true);
        try {
            const response = await fetch('/api/marketing/landing-pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (result.success) {
                setLandingPages(prev => [result.data, ...prev]);
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Error creating landing page:', error);
            return null;
        } finally {
            setIsCreating(false);
        }
    };

    const updateLandingPage = async (
        id: string,
        data: Partial<CreateLandingPageData>
    ): Promise<LandingPage | null> => {
        try {
            const response = await fetch(`/api/marketing/landing-pages/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (result.success) {
                setLandingPages(prev =>
                    prev.map(page => page.id === id ? result.data : page)
                );
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Error updating landing page:', error);
            return null;
        }
    };

    const deleteLandingPage = async (id: string): Promise<boolean> => {
        try {
            const response = await fetch(`/api/marketing/landing-pages/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();
            if (result.success) {
                setLandingPages(prev => prev.filter(page => page.id !== id));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting landing page:', error);
            return false;
        }
    };

    // Coupons
    const refreshCoupons = async () => {
        try {
            const response = await fetch('/api/marketing/coupons');
            const result = await response.json();
            if (result.success) {
                setCoupons(result.data.data);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
        }
    };

    const createCoupon = async (data: CreateCouponData): Promise<Coupon | null> => {
        setIsCreating(true);
        try {
            const response = await fetch('/api/marketing/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (result.success) {
                setCoupons(prev => [result.data, ...prev]);
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Error creating coupon:', error);
            return null;
        } finally {
            setIsCreating(false);
        }
    };

    const validateCoupon = async (
        code: string,
        cartTotal: number,
        productIds: string[] = []
    ) => {
        try {
            const response = await fetch('/api/marketing/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    cart_total: cartTotal,
                    product_ids: productIds,
                }),
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error validating coupon:', error);
            return { success: false, error: 'Failed to validate coupon' };
        }
    };

    // Referral Programs
    const refreshReferralPrograms = async () => {
        try {
            const response = await fetch('/api/marketing/referral-programs');
            const result = await response.json();
            if (result.success) {
                setReferralPrograms(result.data.data);
            }
        } catch (error) {
            console.error('Error fetching referral programs:', error);
        }
    };

    const createReferralProgram = async (data: CreateReferralProgramData): Promise<ReferralProgram | null> => {
        setIsCreating(true);
        try {
            const response = await fetch('/api/marketing/referral-programs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (result.success) {
                setReferralPrograms(prev => [result.data, ...prev]);
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Error creating referral program:', error);
            return null;
        } finally {
            setIsCreating(false);
        }
    };

    return {
        // Data
        emailCampaigns,
        emailTemplates,
        emailSubscribers,
        landingPages,
        coupons,
        referralPrograms,

        // Loading states
        isLoading,
        isCreating,

        // Actions
        createEmailCampaign,
        updateEmailCampaign,
        deleteEmailCampaign,

        createLandingPage,
        updateLandingPage,
        deleteLandingPage,

        createCoupon,
        validateCoupon,

        createReferralProgram,

        // Refresh functions
        refreshEmailCampaigns,
        refreshLandingPages,
        refreshCoupons,
        refreshReferralPrograms,
    };
}