import { z } from 'zod';

// Enums for reuse
export const UserRoleEnum = z.enum(['creator', 'buyer']);
export const ExperienceLevelEnum = z.enum(['beginner', 'intermediate', 'expert']);
export const TimeCommitmentEnum = z.enum(['part-time', 'full-time', 'hobby']);
export const BudgetRangeEnum = z.enum(['free', 'under-50', '50-200', 'premium']);
export const PurchaseFrequencyEnum = z.enum(['rarely', 'monthly', 'weekly', 'daily']);
export const CreatorFirstGoalEnum = z.enum([
    'create-first-product',
    'analyze-market',
    'import-existing',
    'explore-trends',
]);
export const BuyerFirstActionEnum = z.enum([
    'browse-trending',
    'search-specific',
    'view-recommendations',
    'follow-creators',
]);

// User role selection schema
export const roleSelectionSchema = z.object({
    role: UserRoleEnum,
});

// Creator onboarding schemas
export const creatorStep1Schema = z.object({
    productTypes: z
        .array(z.string())
        .min(1, 'Please select at least one product type')
        .max(10, 'Too many product types selected'),
    experienceLevel: ExperienceLevelEnum,
});

export const creatorStep2Schema = z.object({
    monthlyRevenueGoal: z
        .number()
        .min(0, 'Revenue goal must be positive')
        .max(1000000, 'Revenue goal too high'),
    productsPerMonth: z
        .number()
        .min(1, 'Must create at least 1 product per month')
        .max(100, 'Too many products per month'),
    marketingExperience: z
        .string()
        .optional(),
});

export const creatorStep3Schema = z.object({
    firstGoal: CreatorFirstGoalEnum,
    notifications: z
        .object({
            email: z.boolean(),
            push: z.boolean(),
            marketing: z.boolean(),
        })
        .default({
            email: true,
            push: true,
            marketing: false,
        }),
});

// Buyer onboarding schemas
export const buyerStep1Schema = z.object({
    interests: z
        .array(z.string())
        .min(1, 'Please select at least one interest')
        .max(10, 'Too many interests selected'),
    budgetRange: BudgetRangeEnum,
});

export const buyerStep2Schema = z.object({
    categories: z
        .array(z.string())
        .min(1, 'Please select at least one category')
        .max(10, 'Too many categories selected'),
    purchaseFrequency: PurchaseFrequencyEnum,
    preferredFormats: z
        .array(z.string())
        .min(1, 'Please select at least one format')
        .max(10, 'Too many formats selected'),
});

export const buyerStep3Schema = z.object({
    firstAction: BuyerFirstActionEnum,
    notifications: z
        .object({
            email: z.boolean(),
            push: z.boolean(),
            deals: z.boolean(),
            newProducts: z.boolean(),
        })
        .default({
            email: true,
            push: true,
            deals: true,
            newProducts: false,
        }),
});

// Combined onboarding data schema
export const onboardingDataSchema = z.object({
    role: UserRoleEnum,
    step1: z.union([creatorStep1Schema, buyerStep1Schema]),
    step2: z.union([creatorStep2Schema, buyerStep2Schema]),
    step3: z.union([creatorStep3Schema, buyerStep3Schema]),
});

// Types
export type UserRole = z.infer<typeof UserRoleEnum>;
export type ExperienceLevel = z.infer<typeof ExperienceLevelEnum>;
export type TimeCommitment = z.infer<typeof TimeCommitmentEnum>;
export type BudgetRange = z.infer<typeof BudgetRangeEnum>;
export type PurchaseFrequency = z.infer<typeof PurchaseFrequencyEnum>;
export type CreatorFirstGoal = z.infer<typeof CreatorFirstGoalEnum>;
export type BuyerFirstAction = z.infer<typeof BuyerFirstActionEnum>;

export type RoleSelection = z.infer<typeof roleSelectionSchema>;
export type CreatorStep1 = z.infer<typeof creatorStep1Schema>;
export type CreatorStep2 = z.infer<typeof creatorStep2Schema>;
export type CreatorStep3 = z.infer<typeof creatorStep3Schema>;
export type BuyerStep1 = z.infer<typeof buyerStep1Schema>;
export type BuyerStep2 = z.infer<typeof buyerStep2Schema>;
export type BuyerStep3 = z.infer<typeof buyerStep3Schema>;
export type OnboardingData = z.infer<typeof onboardingDataSchema>;

// Onboarding options
export const PRODUCT_TYPES = [
    { id: 'digital-art', label: 'Digital Art & Graphics', icon: '🎨' },
    { id: 'templates', label: 'Templates & Designs', icon: '📄' },
    { id: 'software', label: 'Software & Tools', icon: '💻' },
    { id: 'courses', label: 'Courses & Education', icon: '📚' },
    { id: 'ebooks', label: 'E-books & Guides', icon: '📖' },
    { id: 'music', label: 'Music & Audio', icon: '🎵' },
    { id: 'video', label: 'Video & Animation', icon: '🎬' },
    { id: 'photography', label: 'Photography', icon: '📸' },
    { id: 'fonts', label: 'Fonts & Typography', icon: '🔤' },
    { id: 'ui-kits', label: 'UI Kits & Components', icon: '🎯' },
] as const;

export const CREATOR_INTERESTS = [
    { id: 'design', label: 'Design & Creativity', icon: '🎨' },
    { id: 'technology', label: 'Technology & Development', icon: '💻' },
    { id: 'business', label: 'Business & Marketing', icon: '📈' },
    { id: 'education', label: 'Education & Training', icon: '🎓' },
    { id: 'lifestyle', label: 'Lifestyle & Wellness', icon: '🌱' },
    { id: 'entertainment', label: 'Entertainment & Media', icon: '🎭' },
] as const;

export const CREATOR_GOALS = [
    { id: 'passive-income', label: 'Generate Passive Income', icon: '💰' },
    { id: 'build-audience', label: 'Build an Audience', icon: '👥' },
    { id: 'share-knowledge', label: 'Share Knowledge', icon: '🧠' },
    { id: 'creative-outlet', label: 'Creative Expression', icon: '✨' },
    { id: 'side-hustle', label: 'Start a Side Hustle', icon: '🚀' },
    { id: 'full-business', label: 'Build a Full Business', icon: '🏢' },
] as const;

export const BUYER_CATEGORIES = [
    { id: 'design-assets', label: 'Design Assets', icon: '🎨' },
    { id: 'business-tools', label: 'Business Tools', icon: '💼' },
    { id: 'learning', label: 'Learning Materials', icon: '📚' },
    { id: 'productivity', label: 'Productivity Tools', icon: '⚡' },
    { id: 'creative-software', label: 'Creative Software', icon: '🛠️' },
    { id: 'templates', label: 'Templates & Themes', icon: '📄' },
] as const;

export const PREFERRED_FORMATS = [
    { id: 'digital-downloads', label: 'Digital Downloads', icon: '⬇️' },
    { id: 'saas-tools', label: 'SaaS Tools', icon: '☁️' },
    { id: 'online-courses', label: 'Online Courses', icon: '🎓' },
    { id: 'subscriptions', label: 'Subscriptions', icon: '🔄' },
    { id: 'one-time-purchase', label: 'One-time Purchase', icon: '💳' },
    { id: 'freemium', label: 'Freemium Products', icon: '🆓' },
] as const;