import { describe, it, expect } from 'vitest';
import {
    UserRoleEnum,
    creatorStep1Schema,
    creatorStep2Schema,
    creatorStep3Schema,
    buyerStep1Schema,
    buyerStep2Schema,
    buyerStep3Schema,
    ExperienceLevelEnum,
    BudgetRangeEnum,
    PurchaseFrequencyEnum,
    CreatorFirstGoalEnum,
    BuyerFirstActionEnum,
} from '../onboarding';

describe('Onboarding Validation Schemas', () => {
    describe('UserRoleEnum', () => {
        it('should validate creator role', () => {
            const result = UserRoleEnum.safeParse('creator');
            expect(result.success).toBe(true);
            expect(result.data).toBe('creator');
        });

        it('should validate buyer role', () => {
            const result = UserRoleEnum.safeParse('buyer');
            expect(result.success).toBe(true);
            expect(result.data).toBe('buyer');
        });

        it('should reject invalid role', () => {
            const result = UserRoleEnum.safeParse('invalid');
            expect(result.success).toBe(false);
        });

        it('should reject non-string values', () => {
            const result = UserRoleEnum.safeParse(123);
            expect(result.success).toBe(false);
        });
    });

    describe('creatorStep1Schema', () => {
        const validData = {
            productTypes: ['digital-art'],
            experienceLevel: 'beginner' as const,
        };

        it('should validate valid creator step 1 data', () => {
            const result = creatorStep1Schema.safeParse(validData);
            expect(result.success).toBe(true);
            expect(result.data).toEqual(validData);
        });

        it('should require at least one product type', () => {
            const result = creatorStep1Schema.safeParse({
                ...validData,
                productTypes: [],
            });
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe('Please select at least one product type');
        });

        it('should limit product types to maximum 10', () => {
            const result = creatorStep1Schema.safeParse({
                ...validData,
                productTypes: Array(11).fill('type'),
            });
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe('Too many product types selected');
        });

        it('should validate experience level enum', () => {
            const result = creatorStep1Schema.safeParse({
                ...validData,
                experienceLevel: 'invalid',
            });
            expect(result.success).toBe(false);
        });
    });

    describe('creatorStep2Schema', () => {
        const validData = {
            monthlyRevenueGoal: 1000,
            productsPerMonth: 2,
            marketingExperience: 'Some experience',
        };

        it('should validate valid creator step 2 data', () => {
            const result = creatorStep2Schema.safeParse(validData);
            expect(result.success).toBe(true);
            expect(result.data).toEqual(validData);
        });

        it('should require positive revenue goal', () => {
            const result = creatorStep2Schema.safeParse({
                ...validData,
                monthlyRevenueGoal: -100,
            });
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe('Revenue goal must be positive');
        });

        it('should limit revenue goal maximum', () => {
            const result = creatorStep2Schema.safeParse({
                ...validData,
                monthlyRevenueGoal: 2000000,
            });
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe('Revenue goal too high');
        });

        it('should require at least 1 product per month', () => {
            const result = creatorStep2Schema.safeParse({
                ...validData,
                productsPerMonth: 0,
            });
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe('Must create at least 1 product per month');
        });

        it('should limit products per month maximum', () => {
            const result = creatorStep2Schema.safeParse({
                ...validData,
                productsPerMonth: 150,
            });
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe('Too many products per month');
        });
    });

    describe('creatorStep3Schema', () => {
        const validData = {
            firstGoal: 'create-first-product' as const,
            notifications: {
                email: true,
                push: false,
                marketing: true,
            },
        };

        it('should validate valid creator step 3 data', () => {
            const result = creatorStep3Schema.safeParse(validData);
            expect(result.success).toBe(true);
            expect(result.data).toEqual(validData);
        });

        it('should validate first goal enum', () => {
            const result = creatorStep3Schema.safeParse({
                ...validData,
                firstGoal: 'invalid',
            });
            expect(result.success).toBe(false);
        });
    });

    describe('buyerStep1Schema', () => {
        const validData = {
            interests: ['technology'],
            budgetRange: 'under-50' as const,
        };

        it('should validate valid buyer step 1 data', () => {
            const result = buyerStep1Schema.safeParse(validData);
            expect(result.success).toBe(true);
            expect(result.data).toEqual(validData);
        });

        it('should require at least one interest', () => {
            const result = buyerStep1Schema.safeParse({
                ...validData,
                interests: [],
            });
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe('Please select at least one interest');
        });

        it('should limit interests to maximum 10', () => {
            const result = buyerStep1Schema.safeParse({
                ...validData,
                interests: Array(11).fill('Interest'),
            });
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe('Too many interests selected');
        });

        it('should validate budget range enum', () => {
            const result = buyerStep1Schema.safeParse({
                ...validData,
                budgetRange: 'invalid',
            });
            expect(result.success).toBe(false);
        });
    });

    describe('buyerStep2Schema', () => {
        const validData = {
            categories: ['design-assets'],
            purchaseFrequency: 'monthly' as const,
            preferredFormats: ['digital-downloads'],
        };

        it('should validate valid buyer step 2 data', () => {
            const result = buyerStep2Schema.safeParse(validData);
            expect(result.success).toBe(true);
            expect(result.data).toEqual(validData);
        });

        it('should require at least one category', () => {
            const result = buyerStep2Schema.safeParse({
                ...validData,
                categories: [],
            });
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe('Please select at least one category');
        });

        it('should require at least one preferred format', () => {
            const result = buyerStep2Schema.safeParse({
                ...validData,
                preferredFormats: [],
            });
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe('Please select at least one format');
        });
    });

    describe('buyerStep3Schema', () => {
        const validData = {
            firstAction: 'browse-trending' as const,
            notifications: {
                email: true,
                push: false,
                deals: true,
                newProducts: false,
            },
        };

        it('should validate valid buyer step 3 data', () => {
            const result = buyerStep3Schema.safeParse(validData);
            expect(result.success).toBe(true);
            expect(result.data).toEqual(validData);
        });

        it('should validate first action enum', () => {
            const result = buyerStep3Schema.safeParse({
                ...validData,
                firstAction: 'invalid',
            });
            expect(result.success).toBe(false);
        });
    });

    describe('Enum validations', () => {
        it('should validate ExperienceLevelEnum values', () => {
            expect(ExperienceLevelEnum.safeParse('beginner').success).toBe(true);
            expect(ExperienceLevelEnum.safeParse('intermediate').success).toBe(true);
            expect(ExperienceLevelEnum.safeParse('expert').success).toBe(true);
            expect(ExperienceLevelEnum.safeParse('invalid').success).toBe(false);
        });

        it('should validate BudgetRangeEnum values', () => {
            expect(BudgetRangeEnum.safeParse('free').success).toBe(true);
            expect(BudgetRangeEnum.safeParse('under-50').success).toBe(true);
            expect(BudgetRangeEnum.safeParse('50-200').success).toBe(true);
            expect(BudgetRangeEnum.safeParse('premium').success).toBe(true);
            expect(BudgetRangeEnum.safeParse('invalid').success).toBe(false);
        });

        it('should validate PurchaseFrequencyEnum values', () => {
            expect(PurchaseFrequencyEnum.safeParse('rarely').success).toBe(true);
            expect(PurchaseFrequencyEnum.safeParse('monthly').success).toBe(true);
            expect(PurchaseFrequencyEnum.safeParse('weekly').success).toBe(true);
            expect(PurchaseFrequencyEnum.safeParse('daily').success).toBe(true);
            expect(PurchaseFrequencyEnum.safeParse('invalid').success).toBe(false);
        });

        it('should validate CreatorFirstGoalEnum values', () => {
            expect(CreatorFirstGoalEnum.safeParse('create-first-product').success).toBe(true);
            expect(CreatorFirstGoalEnum.safeParse('analyze-market').success).toBe(true);
            expect(CreatorFirstGoalEnum.safeParse('import-existing').success).toBe(true);
            expect(CreatorFirstGoalEnum.safeParse('explore-trends').success).toBe(true);
            expect(CreatorFirstGoalEnum.safeParse('invalid').success).toBe(false);
        });

        it('should validate BuyerFirstActionEnum values', () => {
            expect(BuyerFirstActionEnum.safeParse('browse-trending').success).toBe(true);
            expect(BuyerFirstActionEnum.safeParse('search-specific').success).toBe(true);
            expect(BuyerFirstActionEnum.safeParse('view-recommendations').success).toBe(true);
            expect(BuyerFirstActionEnum.safeParse('follow-creators').success).toBe(true);
            expect(BuyerFirstActionEnum.safeParse('invalid').success).toBe(false);
        });
    });
});