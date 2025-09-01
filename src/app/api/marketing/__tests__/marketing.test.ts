import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MarketingService } from '@/lib/services/marketing';
import { marketingValidations } from '@/lib/validations/marketing';

// Mock Supabase client
const mockSupabase = {
    from: vi.fn(() => ({
        insert: vi.fn(() => ({
            select: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockEmailCampaign, error: null }))
            }))
        })),
        select: vi.fn(() => ({
            eq: vi.fn(() => ({
                order: vi.fn(() => ({
                    range: vi.fn(() => Promise.resolve({
                        data: [mockEmailCampaign],
                        error: null,
                        count: 1
                    }))
                }))
            }))
        })),
        update: vi.fn(() => ({
            eq: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: mockEmailCampaign, error: null }))
                }))
            }))
        })),
        delete: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null }))
        }))
    }))
};

vi.mock('@/lib/supabase/server', () => ({
    createClient: () => mockSupabase
}));

const mockEmailCampaign = {
    id: '1',
    user_id: 'user-1',
    name: 'Test Campaign',
    subject: 'Test Subject',
    content: 'Test Content',
    status: 'draft',
    recipient_count: 0,
    open_rate: 0,
    click_rate: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
};

const mockCoupon = {
    id: '1',
    user_id: 'user-1',
    code: 'TEST20',
    name: 'Test Coupon',
    type: 'percentage',
    value: 20,
    minimum_amount: 0,
    usage_count: 0,
    user_usage_limit: 1,
    applicable_products: [],
    status: 'active',
    starts_at: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
};

describe('MarketingService', () => {
    let marketingService: MarketingService;

    beforeEach(() => {
        marketingService = new MarketingService();
        vi.clearAllMocks();
    });

    describe('Email Campaigns', () => {
        it('should create an email campaign', async () => {
            const campaignData = {
                name: 'Test Campaign',
                subject: 'Test Subject',
                content: 'Test Content'
            };

            const result = await marketingService.createEmailCampaign('user-1', campaignData);

            expect(result).toEqual(mockEmailCampaign);
            expect(mockSupabase.from).toHaveBeenCalledWith('email_campaigns');
        });

        it('should get email campaigns with pagination', async () => {
            const filters = { page: 1, limit: 20 };

            const result = await marketingService.getEmailCampaigns('user-1', filters);

            expect(result).toEqual({
                data: [mockEmailCampaign],
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 1,
                    totalPages: 1
                }
            });
        });

        it('should update an email campaign', async () => {
            const updates = { name: 'Updated Campaign' };

            const result = await marketingService.updateEmailCampaign('user-1', '1', updates);

            expect(result).toEqual(mockEmailCampaign);
        });

        it('should delete an email campaign', async () => {
            await marketingService.deleteEmailCampaign('user-1', '1');

            expect(mockSupabase.from).toHaveBeenCalledWith('email_campaigns');
        });
    });

    describe('Coupons', () => {
        it('should create a coupon', async () => {
            const couponData = {
                code: 'TEST20',
                name: 'Test Coupon',
                type: 'percentage' as const,
                value: 20
            };

            mockSupabase.from.mockReturnValueOnce({
                insert: vi.fn(() => ({
                    select: vi.fn(() => ({
                        single: vi.fn(() => Promise.resolve({ data: mockCoupon, error: null }))
                    }))
                }))
            });

            const result = await marketingService.createCoupon('user-1', couponData);

            expect(result).toEqual(mockCoupon);
        });

        it('should validate a coupon successfully', async () => {
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => Promise.resolve({ data: mockCoupon, error: null }))
                    }))
                }))
            });

            // Mock the usage count check
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn(() => ({
                    eq: vi.fn(() => Promise.resolve({ count: 0 }))
                }))
            });

            const result = await marketingService.validateCoupon('TEST20', 100, 'user-1');

            expect(result).toEqual(mockCoupon);
        });

        it('should return null for invalid coupon', async () => {
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => Promise.resolve({ data: null, error: 'Not found' }))
                    }))
                }))
            });

            const result = await marketingService.validateCoupon('INVALID', 100, 'user-1');

            expect(result).toBeNull();
        });
    });
});

describe('Marketing Validations', () => {
    describe('Email Campaign Validation', () => {
        it('should validate correct email campaign data', () => {
            const validData = {
                name: 'Test Campaign',
                subject: 'Test Subject',
                content: 'Test Content'
            };

            const result = marketingValidations.createEmailCampaign.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should reject invalid email campaign data', () => {
            const invalidData = {
                name: '', // Empty name
                subject: 'Test Subject',
                content: 'Test Content'
            };

            const result = marketingValidations.createEmailCampaign.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('Coupon Validation', () => {
        it('should validate correct coupon data', () => {
            const validData = {
                code: 'TEST20',
                name: 'Test Coupon',
                type: 'percentage',
                value: 20
            };

            const result = marketingValidations.createCoupon.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should reject percentage over 100%', () => {
            const invalidData = {
                code: 'TEST150',
                name: 'Test Coupon',
                type: 'percentage',
                value: 150 // Invalid percentage
            };

            const result = marketingValidations.createCoupon.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should reject invalid coupon code format', () => {
            const invalidData = {
                code: 'test-code', // Lowercase not allowed
                name: 'Test Coupon',
                type: 'percentage',
                value: 20
            };

            const result = marketingValidations.createCoupon.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('Landing Page Validation', () => {
        it('should validate correct landing page data', () => {
            const validData = {
                name: 'Test Page',
                slug: 'test-page',
                title: 'Test Page Title'
            };

            const result = marketingValidations.createLandingPage.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should reject invalid slug format', () => {
            const invalidData = {
                name: 'Test Page',
                slug: 'Test Page!', // Invalid characters
                title: 'Test Page Title'
            };

            const result = marketingValidations.createLandingPage.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('Referral Program Validation', () => {
        it('should validate correct referral program data', () => {
            const validData = {
                name: 'Test Program',
                reward_type: 'percentage',
                reward_value: 10
            };

            const result = marketingValidations.createReferralProgram.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should reject percentage reward over 100%', () => {
            const invalidData = {
                name: 'Test Program',
                reward_type: 'percentage',
                reward_value: 150 // Invalid percentage
            };

            const result = marketingValidations.createReferralProgram.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
});