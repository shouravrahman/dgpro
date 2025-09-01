/**
 * Product Form Types and Interfaces
 * Comprehensive type definitions for the product management form system
 */

import { z } from 'zod';
import type { Product, ProductCategory, PricingType } from './database';

// Form Step Types
export type FormStep =
    | 'category-selection'
    | 'basic-info'
    | 'content-details'
    | 'pricing-setup'
    | 'assets-upload'
    | 'preview-publish';

export type FormMode = 'create' | 'edit' | 'duplicate' | 'bulk-edit';

// Form Field Types
export type FieldType =
    | 'text'
    | 'textarea'
    | 'select'
    | 'multiselect'
    | 'checkbox'
    | 'radio'
    | 'number'
    | 'currency'
    | 'date'
    | 'datetime'
    | 'file'
    | 'image'
    | 'rich-text'
    | 'tags'
    | 'color'
    | 'url'
    | 'email'
    | 'phone'
    | 'json'
    | 'code'
    | 'slider'
    | 'rating'
    | 'toggle';

// Validation Types
export interface ValidationRule {
    type: 'required' | 'min' | 'max' | 'pattern' | 'custom' | 'file-size' | 'file-type';
    value?: any;
    message: string;
    condition?: ConditionalLogic;
}

export interface ConditionalLogic {
    field: string;
    operator: 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'greater' | 'less' | 'in' | 'not-in';
    value: any;
}

// Form Field Configuration
export interface FormFieldConfig {
    id: string;
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    description?: string;
    defaultValue?: any;
    required?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    validation?: ValidationRule[];
    options?: SelectOption[];
    conditionalLogic?: ConditionalLogic[];
    metadata?: Record<string, any>;

    // File upload specific
    accept?: string[];
    maxSize?: number;
    multiple?: boolean;

    // Rich text specific
    toolbar?: string[];

    // Number/Currency specific
    min?: number;
    max?: number;
    step?: number;
    currency?: string;

    // Layout
    width?: 'full' | 'half' | 'third' | 'quarter';
    order?: number;
}

export interface SelectOption {
    value: string;
    label: string;
    description?: string;
    icon?: string;
    disabled?: boolean;
    group?: string;
}

// Form Section Configuration
export interface FormSection {
    id: string;
    title: string;
    description?: string;
    icon?: string;
    fields: FormFieldConfig[];
    conditionalLogic?: ConditionalLogic[];
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    order?: number;
}

// Form Configuration
export interface FormConfig {
    id: string;
    title: string;
    description?: string;
    mode: FormMode;
    categoryId?: string;
    sections: FormSection[];
    steps?: FormStep[];
    autoSave?: boolean;
    autoSaveInterval?: number;
    showProgress?: boolean;
    allowDraft?: boolean;
    metadata?: Record<string, any>;
}

// Form State Management
export interface FormState {
    currentStep: FormStep;
    completedSteps: FormStep[];
    data: Record<string, any>;
    errors: Record<string, string[]>;
    touched: Record<string, boolean>;
    isDirty: boolean;
    isSubmitting: boolean;
    isValid: boolean;
    lastSaved?: Date;
    draftId?: string;
}

// File Upload Types
export interface FileUploadConfig {
    accept: string[];
    maxSize: number;
    maxFiles: number;
    allowedTypes: string[];
    compressionEnabled: boolean;
    generateThumbnails: boolean;
    virusScanEnabled: boolean;
}

export interface UploadedFile {
    id: string;
    name: string;
    originalName: string;
    size: number;
    type: string;
    url: string;
    thumbnailUrl?: string;
    metadata?: Record<string, any>;
    uploadedAt: Date;
    status: 'uploading' | 'processing' | 'completed' | 'error';
    progress?: number;
    error?: string;
}

// Product Form Data
export interface ProductFormData {
    // Basic Information
    name: string;
    slug?: string;
    shortDescription?: string;
    description?: string;
    categoryId?: string;
    subcategoryId?: string;

    // Content
    content: Record<string, any>;
    features: string[];
    tags: string[];

    // Pricing
    pricingType: PricingType;
    price: number;
    currency: string;
    subscriptionInterval?: string;
    compareAtPrice?: number;

    // Assets
    images: UploadedFile[];
    documents: UploadedFile[];
    media: UploadedFile[];
    downloadableFiles: UploadedFile[];

    // SEO
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords: string[];

    // Settings
    status: 'draft' | 'published' | 'archived';
    isFeatured: boolean;
    allowComments: boolean;
    allowReviews: boolean;

    // Metadata
    metadata: Record<string, any>;
}

// Bulk Edit Types
export interface BulkEditConfig {
    productIds: string[];
    fields: string[];
    operations: BulkOperation[];
}

export interface BulkOperation {
    field: string;
    operation: 'set' | 'append' | 'prepend' | 'remove' | 'replace';
    value: any;
    condition?: ConditionalLogic;
}

export interface BulkEditResult {
    success: boolean;
    updatedCount: number;
    errors: Array<{
        productId: string;
        field: string;
        error: string;
    }>;
}

// Form Validation Schemas
export const ProductFormSchema = z.object({
    name: z.string()
        .min(1, 'Product name is required')
        .max(100, 'Product name must be less than 100 characters'),

    slug: z.string()
        .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
        .optional(),

    shortDescription: z.string()
        .max(200, 'Short description must be less than 200 characters')
        .optional(),

    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .optional(),

    categoryId: z.string()
        .min(1, 'Category is required'),

    pricingType: z.enum(['free', 'one_time', 'subscription', 'bundle']),

    price: z.number()
        .min(0, 'Price must be positive')
        .max(999999, 'Price is too high'),

    currency: z.string()
        .length(3, 'Currency must be 3 characters'),

    features: z.array(z.string())
        .max(20, 'Maximum 20 features allowed'),

    tags: z.array(z.string())
        .max(10, 'Maximum 10 tags allowed'),

    seoKeywords: z.array(z.string())
        .max(15, 'Maximum 15 SEO keywords allowed'),

    status: z.enum(['draft', 'published', 'archived']),

    isFeatured: z.boolean(),
    allowComments: z.boolean(),
    allowReviews: z.boolean(),
});

// Category-specific validation schemas
export const CategoryValidationSchemas = {
    'design-graphics': z.object({
        designType: z.enum(['logo', 'template', 'illustration', 'icon-set', 'mockup']),
        softwareUsed: z.array(z.string()).min(1, 'At least one software must be specified'),
        fileFormats: z.array(z.string()).min(1, 'At least one file format required'),
        colorScheme: z.string().optional(),
        dimensions: z.object({
            width: z.number().positive(),
            height: z.number().positive(),
            unit: z.enum(['px', 'in', 'cm', 'mm'])
        }).optional(),
    }),

    'software-tools': z.object({
        platform: z.array(z.enum(['web', 'desktop', 'mobile', 'api'])),
        programmingLanguage: z.array(z.string()).optional(),
        systemRequirements: z.string().optional(),
        licenseType: z.enum(['mit', 'gpl', 'commercial', 'proprietary']),
        sourceCodeIncluded: z.boolean(),
    }),

    'educational-content': z.object({
        contentType: z.enum(['course', 'tutorial', 'ebook', 'guide', 'template']),
        skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
        duration: z.string().optional(),
        prerequisites: z.array(z.string()).optional(),
        learningOutcomes: z.array(z.string()).min(1, 'At least one learning outcome required'),
    }),

    'business-templates': z.object({
        templateType: z.enum(['presentation', 'document', 'spreadsheet', 'form', 'contract']),
        industry: z.array(z.string()).optional(),
        customizable: z.boolean(),
        includesInstructions: z.boolean(),
    }),
};

// Auto-save configuration
export interface AutoSaveConfig {
    enabled: boolean;
    interval: number; // milliseconds
    maxDrafts: number;
    compression: boolean;
    encryption: boolean;
}

// Form Analytics
export interface FormAnalytics {
    formId: string;
    userId?: string;
    sessionId: string;
    events: FormEvent[];
    startTime: Date;
    endTime?: Date;
    completed: boolean;
    abandoned: boolean;
    errors: FormError[];
}

export interface FormEvent {
    type: 'field_focus' | 'field_blur' | 'field_change' | 'step_change' | 'validation_error' | 'save' | 'submit';
    timestamp: Date;
    fieldId?: string;
    stepId?: string;
    value?: any;
    metadata?: Record<string, any>;
}

export interface FormError {
    fieldId: string;
    errorType: string;
    errorMessage: string;
    timestamp: Date;
    resolved: boolean;
    resolvedAt?: Date;
}

// Export types for external use
export type {
    Product,
    ProductCategory,
    PricingType
} from './database';