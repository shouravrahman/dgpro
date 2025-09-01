import { z } from 'zod';

// Product category enums
export const ProductCategoryEnum = z.enum([
    'digital-art',
    'templates',
    'software',
    'courses',
    'ebooks',
    'music',
    'video',
    'photography',
    'fonts',
    'ui-kits',
    'plugins',
    'themes',
    'stock-photos',
    'icons',
    'mockups'
]);

export const ProductStatusEnum = z.enum([
    'draft',
    'pending-review',
    'published',
    'archived',
    'rejected'
]);

export const LicenseTypeEnum = z.enum([
    'personal',
    'commercial',
    'extended',
    'exclusive'
]);

export const DifficultyLevelEnum = z.enum([
    'beginner',
    'intermediate',
    'advanced',
    'expert'
]);

// File validation schemas
const fileSchema = z.object({
    name: z.string().min(1, 'File name is required'),
    size: z.number().min(1, 'File size must be greater than 0'),
    type: z.string().min(1, 'File type is required'),
    url: z.string().url('Invalid file URL').optional(),
});

const imageSchema = fileSchema.extend({
    type: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp)$/, 'Invalid image format'),
    size: z.number().max(10 * 1024 * 1024, 'Image must be less than 10MB'),
    width: z.number().min(1).optional(),
    height: z.number().min(1).optional(),
});

// Product creation schema
export const createProductSchema = z.object({
    title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must be less than 100 characters')
        .regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, 'Title contains invalid characters'),

    description: z
        .string()
        .min(20, 'Description must be at least 20 characters')
        .max(2000, 'Description must be less than 2000 characters'),

    shortDescription: z
        .string()
        .min(10, 'Short description must be at least 10 characters')
        .max(200, 'Short description must be less than 200 characters'),

    category: ProductCategoryEnum,

    subcategory: z
        .string()
        .min(1, 'Subcategory is required')
        .max(50, 'Subcategory too long'),

    tags: z
        .array(z.string().min(1).max(30))
        .min(1, 'At least one tag is required')
        .max(10, 'Maximum 10 tags allowed'),

    price: z
        .number()
        .min(0, 'Price cannot be negative')
        .max(10000, 'Price cannot exceed $10,000')
        .multipleOf(0.01, 'Price must have at most 2 decimal places'),

    compareAtPrice: z
        .number()
        .min(0, 'Compare price cannot be negative')
        .max(10000, 'Compare price cannot exceed $10,000')
        .optional(),

    licenseType: LicenseTypeEnum,

    difficultyLevel: DifficultyLevelEnum.optional(),

    features: z
        .array(z.string().min(1).max(100))
        .min(1, 'At least one feature is required')
        .max(20, 'Maximum 20 features allowed'),

    requirements: z
        .array(z.string().min(1).max(100))
        .max(10, 'Maximum 10 requirements allowed')
        .optional(),

    whatYouGet: z
        .array(z.string().min(1).max(100))
        .min(1, 'At least one item in "what you get" is required')
        .max(15, 'Maximum 15 items allowed'),

    thumbnailImage: imageSchema,

    previewImages: z
        .array(imageSchema)
        .min(1, 'At least one preview image is required')
        .max(10, 'Maximum 10 preview images allowed'),

    files: z
        .array(fileSchema)
        .min(1, 'At least one file is required')
        .max(50, 'Maximum 50 files allowed'),

    demoUrl: z
        .string()
        .url('Invalid demo URL')
        .optional()
        .or(z.literal('')),

    videoUrl: z
        .string()
        .url('Invalid video URL')
        .optional()
        .or(z.literal('')),

    seoTitle: z
        .string()
        .max(60, 'SEO title must be less than 60 characters')
        .optional(),

    seoDescription: z
        .string()
        .max(160, 'SEO description must be less than 160 characters')
        .optional(),

    isDigitalProduct: z.boolean().default(true),

    allowReviews: z.boolean().default(true),

    isActive: z.boolean().default(true),
});

// Product update schema (all fields optional except ID)
export const updateProductSchema = createProductSchema.partial().extend({
    id: z.string().min(1, 'Product ID is required'),
});

// Product search/filter schema
export const productSearchSchema = z.object({
    query: z.string().max(100).optional(),
    category: ProductCategoryEnum.optional(),
    subcategory: z.string().max(50).optional(),
    tags: z.array(z.string()).max(10).optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    licenseType: LicenseTypeEnum.optional(),
    difficultyLevel: DifficultyLevelEnum.optional(),
    sortBy: z.enum(['newest', 'oldest', 'price-low', 'price-high', 'popular', 'rating']).optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
});

// Product review schema
export const productReviewSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    rating: z
        .number()
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating cannot exceed 5')
        .int('Rating must be a whole number'),
    title: z
        .string()
        .min(3, 'Review title must be at least 3 characters')
        .max(100, 'Review title must be less than 100 characters'),
    comment: z
        .string()
        .min(10, 'Review comment must be at least 10 characters')
        .max(1000, 'Review comment must be less than 1000 characters'),
    pros: z
        .array(z.string().min(1).max(100))
        .max(5, 'Maximum 5 pros allowed')
        .optional(),
    cons: z
        .array(z.string().min(1).max(100))
        .max(5, 'Maximum 5 cons allowed')
        .optional(),
    wouldRecommend: z.boolean().optional(),
});

// Product collection schema
export const productCollectionSchema = z.object({
    name: z
        .string()
        .min(3, 'Collection name must be at least 3 characters')
        .max(50, 'Collection name must be less than 50 characters'),
    description: z
        .string()
        .max(200, 'Description must be less than 200 characters')
        .optional(),
    isPublic: z.boolean().default(false),
    productIds: z
        .array(z.string())
        .min(1, 'At least one product is required')
        .max(100, 'Maximum 100 products per collection'),
});

// Bulk product operations schema
export const bulkProductOperationSchema = z.object({
    productIds: z
        .array(z.string())
        .min(1, 'At least one product ID is required')
        .max(100, 'Maximum 100 products per operation'),
    operation: z.enum(['publish', 'unpublish', 'archive', 'delete', 'update-category', 'update-tags']),
    data: z.record(z.any()).optional(), // Additional data for the operation
});

// Product analytics schema
export const productAnalyticsSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    startDate: z.date(),
    endDate: z.date(),
    metrics: z
        .array(z.enum(['views', 'downloads', 'sales', 'revenue', 'conversion']))
        .min(1, 'At least one metric is required'),
});

// Export types
export type ProductCategory = z.infer<typeof ProductCategoryEnum>;
export type ProductStatus = z.infer<typeof ProductStatusEnum>;
export type LicenseType = z.infer<typeof LicenseTypeEnum>;
export type DifficultyLevel = z.infer<typeof DifficultyLevelEnum>;

export type CreateProductData = z.infer<typeof createProductSchema>;
export type UpdateProductData = z.infer<typeof updateProductSchema>;
export type ProductSearchData = z.infer<typeof productSearchSchema>;
export type ProductReviewData = z.infer<typeof productReviewSchema>;
export type ProductCollectionData = z.infer<typeof productCollectionSchema>;
export type BulkProductOperationData = z.infer<typeof bulkProductOperationSchema>;
export type ProductAnalyticsData = z.infer<typeof productAnalyticsSchema>;

// Validation refinements
export const createProductSchemaRefined = createProductSchema
    .refine((data) => {
        // Compare price should be higher than regular price
        if (data.compareAtPrice && data.compareAtPrice <= data.price) {
            return false;
        }
        return true;
    }, {
        message: 'Compare price must be higher than regular price',
        path: ['compareAtPrice'],
    })
    .refine((data) => {
        // Validate file types based on category
        const allowedTypes: Record<string, string[]> = {
            'digital-art': ['image/', 'application/zip', 'application/x-rar'],
            'software': ['application/zip', 'application/x-rar', 'application/octet-stream'],
            'ebooks': ['application/pdf', 'application/epub+zip'],
            'music': ['audio/', 'application/zip'],
            'video': ['video/', 'application/zip'],
            'fonts': ['font/', 'application/zip', 'application/x-font-ttf'],
        };

        const categoryTypes = allowedTypes[data.category];
        if (categoryTypes) {
            return data.files.every(file =>
                categoryTypes.some(type => file.type.startsWith(type))
            );
        }
        return true;
    }, {
        message: 'Invalid file types for selected category',
        path: ['files'],
    });

// Input sanitization utilities
export function sanitizeProductTitle(title: string): string {
    return title
        .trim()
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ') // Replace multiple spaces
        .substring(0, 100); // Limit length
}

export function sanitizeProductDescription(description: string): string {
    return description
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .substring(0, 2000); // Limit length
}

export function sanitizeProductTags(tags: string[]): string[] {
    return tags
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0 && tag.length <= 30)
        .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
        .slice(0, 10); // Limit to 10 tags
}

// Product validation utilities
export function validateFileSize(file: File, maxSizeMB: number): boolean {
    return file.size <= maxSizeMB * 1024 * 1024;
}

export function validateImageDimensions(
    width: number,
    height: number,
    minWidth: number = 300,
    minHeight: number = 300
): boolean {
    return width >= minWidth && height >= minHeight;
}

export function validateProductSlug(slug: string): boolean {
    return /^[a-z0-9-]+$/.test(slug) && slug.length >= 3 && slug.length <= 100;
}