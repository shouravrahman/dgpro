/**
 * Dynamic Form Generator
 * Generates forms based on product categories and user requirements
 */

import { z } from 'zod';
import type {
    FormConfig,
    FormSection,
    FormFieldConfig,
    ProductFormData,
    ConditionalLogic,
    ValidationRule,
    SelectOption,
    FieldType
} from '@/types/product-forms';
import type { ProductCategory } from '@/types/database';
import { getCategoryById } from '@/lib/categories';

export class FormGenerator {
    private static instance: FormGenerator;

    public static getInstance(): FormGenerator {
        if (!FormGenerator.instance) {
            FormGenerator.instance = new FormGenerator();
        }
        return FormGenerator.instance;
    }

    /**
     * Generate complete form configuration for a product category
     */
    generateFormConfig(categoryId: string, mode: 'create' | 'edit' = 'create'): FormConfig {
        const category = getCategoryById(categoryId);
        if (!category) {
            throw new Error(`Category not found: ${categoryId}`);
        }

        const sections = this.generateFormSections(category, mode);

        return {
            id: `product-form-${categoryId}`,
            title: `${mode === 'create' ? 'Create' : 'Edit'} ${category.name}`,
            description: `${mode === 'create' ? 'Create a new' : 'Edit your'} ${category.name.toLowerCase()} product`,
            mode,
            categoryId,
            sections,
            steps: ['category-selection', 'basic-info', 'content-details', 'pricing-setup', 'assets-upload', 'preview-publish'],
            autoSave: true,
            autoSaveInterval: 30000, // 30 seconds
            showProgress: true,
            allowDraft: true,
            metadata: {
                category: category.name,
                estimatedTime: category.metadata.estimatedCreationTime,
                difficulty: category.metadata.skillLevel
            }
        };
    }

    /**
     * Generate form sections based on category requirements
     */
    private generateFormSections(category: ProductCategory, mode: string): FormSection[] {
        const sections: FormSection[] = [];

        // Basic Information Section
        sections.push(this.generateBasicInfoSection(category));

        // Category-specific Content Section
        sections.push(this.generateCategorySpecificSection(category));

        // Pricing Section
        sections.push(this.generatePricingSection(category));

        // Assets & Files Section
        sections.push(this.generateAssetsSection(category));

        // SEO & Marketing Section
        sections.push(this.generateSEOSection(category));

        // Advanced Settings Section
        if (mode === 'edit') {
            sections.push(this.generateAdvancedSettingsSection(category));
        }

        return sections;
    }

    /**
     * Generate basic information section
     */
    private generateBasicInfoSection(category: ProductCategory): FormSection {
        const fields: FormFieldConfig[] = [
            {
                id: 'name',
                name: 'name',
                label: 'Product Name',
                type: 'text',
                placeholder: 'Enter a compelling product name',
                description: 'Choose a clear, descriptive name that highlights your product\'s main benefit',
                required: true,
                validation: [
                    { type: 'required', message: 'Product name is required' },
                    { type: 'min', value: 3, message: 'Name must be at least 3 characters' },
                    { type: 'max', value: 100, message: 'Name must be less than 100 characters' }
                ],
                width: 'full',
                order: 1
            },
            {
                id: 'slug',
                name: 'slug',
                label: 'URL Slug',
                type: 'text',
                placeholder: 'auto-generated-from-name',
                description: 'URL-friendly version of your product name (auto-generated)',
                validation: [
                    { type: 'pattern', value: '^[a-z0-9-]+$', message: 'Only lowercase letters, numbers, and hyphens allowed' }
                ],
                width: 'half',
                order: 2
            },
            {
                id: 'shortDescription',
                name: 'shortDescription',
                label: 'Short Description',
                type: 'textarea',
                placeholder: 'Brief description for listings and previews',
                description: 'A concise summary that appears in search results and product cards',
                validation: [
                    { type: 'max', value: 200, message: 'Short description must be less than 200 characters' }
                ],
                width: 'full',
                order: 3
            },
            {
                id: 'description',
                name: 'description',
                label: 'Full Description',
                type: 'rich-text',
                placeholder: 'Detailed product description...',
                description: 'Comprehensive description with features, benefits, and usage instructions',
                toolbar: ['bold', 'italic', 'underline', 'link', 'bulletList', 'orderedList', 'blockquote', 'code'],
                validation: [
                    { type: 'min', value: 50, message: 'Description must be at least 50 characters' }
                ],
                width: 'full',
                order: 4
            },
            {
                id: 'tags',
                name: 'tags',
                label: 'Tags',
                type: 'tags',
                placeholder: 'Add relevant tags...',
                description: 'Help users discover your product with relevant keywords',
                validation: [
                    { type: 'max', value: 10, message: 'Maximum 10 tags allowed' }
                ],
                width: 'full',
                order: 5
            }
        ];

        return {
            id: 'basic-info',
            title: 'Basic Information',
            description: 'Essential details about your product',
            icon: 'info',
            fields,
            order: 1
        };
    }

    /**
     * Generate category-specific content section
     */
    private generateCategorySpecificSection(category: ProductCategory): FormSection {
        const fields: FormFieldConfig[] = [];

        // Add category-specific fields based on category requirements
        if (category.requirements?.requiredFields) {
            category.requirements.requiredFields.forEach((fieldName, index) => {
                const field = this.generateCategoryField(fieldName, category, index + 1);
                if (field) {
                    fields.push(field);
                }
            });
        }

        // Add features field
        fields.push({
            id: 'features',
            name: 'features',
            label: 'Key Features',
            type: 'tags',
            placeholder: 'Add key features...',
            description: 'List the main features and benefits of your product',
            validation: [
                { type: 'min', value: 1, message: 'At least one feature is required' },
                { type: 'max', value: 20, message: 'Maximum 20 features allowed' }
            ],
            width: 'full',
            order: 100
        });

        return {
            id: 'category-specific',
            title: `${category.name} Details`,
            description: `Specific information for ${category.name.toLowerCase()} products`,
            icon: 'settings',
            fields,
            order: 2
        };
    }

    /**
     * Generate category-specific field configuration
     */
    private generateCategoryField(fieldName: string, category: ProductCategory, order: number): FormFieldConfig | null {
        const fieldConfigs: Record<string, Partial<FormFieldConfig>> = {
            // Design & Graphics fields
            designType: {
                type: 'select',
                label: 'Design Type',
                options: [
                    { value: 'logo', label: 'Logo Design' },
                    { value: 'template', label: 'Template' },
                    { value: 'illustration', label: 'Illustration' },
                    { value: 'icon-set', label: 'Icon Set' },
                    { value: 'mockup', label: 'Mockup' },
                    { value: 'other', label: 'Other' }
                ]
            },
            softwareUsed: {
                type: 'multiselect',
                label: 'Software Used',
                options: [
                    { value: 'photoshop', label: 'Adobe Photoshop' },
                    { value: 'illustrator', label: 'Adobe Illustrator' },
                    { value: 'figma', label: 'Figma' },
                    { value: 'sketch', label: 'Sketch' },
                    { value: 'canva', label: 'Canva' },
                    { value: 'other', label: 'Other' }
                ]
            },
            fileFormats: {
                type: 'multiselect',
                label: 'File Formats Included',
                options: [
                    { value: 'psd', label: 'PSD (Photoshop)' },
                    { value: 'ai', label: 'AI (Illustrator)' },
                    { value: 'fig', label: 'FIG (Figma)' },
                    { value: 'png', label: 'PNG' },
                    { value: 'jpg', label: 'JPG' },
                    { value: 'svg', label: 'SVG' },
                    { value: 'pdf', label: 'PDF' }
                ]
            },

            // Software & Tools fields
            platform: {
                type: 'multiselect',
                label: 'Platform',
                options: [
                    { value: 'web', label: 'Web Application' },
                    { value: 'desktop', label: 'Desktop Application' },
                    { value: 'mobile', label: 'Mobile App' },
                    { value: 'api', label: 'API/Service' }
                ]
            },
            programmingLanguage: {
                type: 'multiselect',
                label: 'Programming Languages',
                options: [
                    { value: 'javascript', label: 'JavaScript' },
                    { value: 'typescript', label: 'TypeScript' },
                    { value: 'python', label: 'Python' },
                    { value: 'java', label: 'Java' },
                    { value: 'csharp', label: 'C#' },
                    { value: 'php', label: 'PHP' },
                    { value: 'other', label: 'Other' }
                ]
            },
            licenseType: {
                type: 'select',
                label: 'License Type',
                options: [
                    { value: 'mit', label: 'MIT License' },
                    { value: 'gpl', label: 'GPL License' },
                    { value: 'commercial', label: 'Commercial License' },
                    { value: 'proprietary', label: 'Proprietary' }
                ]
            },

            // Educational Content fields
            contentType: {
                type: 'select',
                label: 'Content Type',
                options: [
                    { value: 'course', label: 'Online Course' },
                    { value: 'tutorial', label: 'Tutorial Series' },
                    { value: 'ebook', label: 'E-book' },
                    { value: 'guide', label: 'Guide/Manual' },
                    { value: 'template', label: 'Template' }
                ]
            },
            skillLevel: {
                type: 'select',
                label: 'Skill Level',
                options: [
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' },
                    { value: 'expert', label: 'Expert' }
                ]
            },
            duration: {
                type: 'text',
                label: 'Duration',
                placeholder: 'e.g., 2 hours, 5 days, 3 weeks'
            },

            // Business Templates fields
            templateType: {
                type: 'select',
                label: 'Template Type',
                options: [
                    { value: 'presentation', label: 'Presentation' },
                    { value: 'document', label: 'Document' },
                    { value: 'spreadsheet', label: 'Spreadsheet' },
                    { value: 'form', label: 'Form' },
                    { value: 'contract', label: 'Contract' }
                ]
            },
            industry: {
                type: 'multiselect',
                label: 'Target Industries',
                options: [
                    { value: 'technology', label: 'Technology' },
                    { value: 'healthcare', label: 'Healthcare' },
                    { value: 'finance', label: 'Finance' },
                    { value: 'education', label: 'Education' },
                    { value: 'retail', label: 'Retail' },
                    { value: 'consulting', label: 'Consulting' },
                    { value: 'other', label: 'Other' }
                ]
            }
        };

        const baseConfig = fieldConfigs[fieldName];
        if (!baseConfig) {
            return null;
        }

        return {
            id: fieldName,
            name: fieldName,
            label: baseConfig.label || fieldName,
            type: baseConfig.type || 'text',
            placeholder: baseConfig.placeholder,
            description: baseConfig.description,
            options: baseConfig.options,
            required: true,
            validation: [
                { type: 'required', message: `${baseConfig.label || fieldName} is required` }
            ],
            width: 'half',
            order
        };
    }

    /**
     * Generate pricing section
     */
    private generatePricingSection(category: ProductCategory): FormSection {
        const fields: FormFieldConfig[] = [
            {
                id: 'pricingType',
                name: 'pricingType',
                label: 'Pricing Model',
                type: 'radio',
                options: [
                    { value: 'free', label: 'Free', description: 'No cost to users' },
                    { value: 'one_time', label: 'One-time Purchase', description: 'Single payment' },
                    { value: 'subscription', label: 'Subscription', description: 'Recurring payments' },
                    { value: 'bundle', label: 'Bundle', description: 'Part of a product bundle' }
                ],
                defaultValue: 'one_time',
                required: true,
                width: 'full',
                order: 1
            },
            {
                id: 'price',
                name: 'price',
                label: 'Price',
                type: 'currency',
                currency: 'USD',
                min: 0,
                max: 999999,
                step: 0.01,
                placeholder: '0.00',
                description: 'Set your product price',
                conditionalLogic: [
                    { field: 'pricingType', operator: 'not-equals', value: 'free' }
                ],
                validation: [
                    {
                        type: 'required',
                        message: 'Price is required',
                        condition: { field: 'pricingType', operator: 'not-equals', value: 'free' }
                    },
                    { type: 'min', value: 0, message: 'Price must be positive' }
                ],
                width: 'half',
                order: 2
            },
            {
                id: 'compareAtPrice',
                name: 'compareAtPrice',
                label: 'Compare at Price',
                type: 'currency',
                currency: 'USD',
                placeholder: '0.00',
                description: 'Original price for showing discounts',
                conditionalLogic: [
                    { field: 'pricingType', operator: 'not-equals', value: 'free' }
                ],
                width: 'half',
                order: 3
            },
            {
                id: 'subscriptionInterval',
                name: 'subscriptionInterval',
                label: 'Billing Interval',
                type: 'select',
                options: [
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'quarterly', label: 'Quarterly' },
                    { value: 'yearly', label: 'Yearly' }
                ],
                conditionalLogic: [
                    { field: 'pricingType', operator: 'equals', value: 'subscription' }
                ],
                validation: [
                    {
                        type: 'required',
                        message: 'Billing interval is required for subscriptions',
                        condition: { field: 'pricingType', operator: 'equals', value: 'subscription' }
                    }
                ],
                width: 'half',
                order: 4
            }
        ];

        return {
            id: 'pricing',
            title: 'Pricing & Monetization',
            description: 'Set your product pricing and monetization strategy',
            icon: 'dollar-sign',
            fields,
            order: 3
        };
    }

    /**
     * Generate assets and files section
     */
    private generateAssetsSection(category: ProductCategory): FormSection {
        const fields: FormFieldConfig[] = [
            {
                id: 'images',
                name: 'images',
                label: 'Product Images',
                type: 'image',
                accept: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
                maxSize: 10 * 1024 * 1024, // 10MB
                multiple: true,
                description: 'Upload high-quality images showcasing your product',
                validation: [
                    { type: 'required', message: 'At least one product image is required' },
                    { type: 'file-size', value: 10 * 1024 * 1024, message: 'Image size must be less than 10MB' },
                    { type: 'file-type', value: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], message: 'Only JPG, PNG, GIF, and WebP images allowed' }
                ],
                width: 'full',
                order: 1
            },
            {
                id: 'downloadableFiles',
                name: 'downloadableFiles',
                label: 'Downloadable Files',
                type: 'file',
                accept: category.requirements?.fileTypes || ['.zip', '.pdf', '.docx'],
                maxSize: 500 * 1024 * 1024, // 500MB
                multiple: true,
                description: 'Upload the actual product files that customers will download',
                validation: [
                    { type: 'required', message: 'At least one downloadable file is required' },
                    { type: 'file-size', value: 500 * 1024 * 1024, message: 'File size must be less than 500MB' }
                ],
                width: 'full',
                order: 2
            },
            {
                id: 'documents',
                name: 'documents',
                label: 'Documentation',
                type: 'file',
                accept: ['.pdf', '.docx', '.txt', '.md'],
                maxSize: 50 * 1024 * 1024, // 50MB
                multiple: true,
                description: 'Upload documentation, instructions, or guides (optional)',
                width: 'full',
                order: 3
            }
        ];

        return {
            id: 'assets',
            title: 'Assets & Files',
            description: 'Upload your product files and media',
            icon: 'upload',
            fields,
            order: 4
        };
    }

    /**
     * Generate SEO section
     */
    private generateSEOSection(category: ProductCategory): FormSection {
        const fields: FormFieldConfig[] = [
            {
                id: 'seoTitle',
                name: 'seoTitle',
                label: 'SEO Title',
                type: 'text',
                placeholder: 'Optimized title for search engines',
                description: 'Title that appears in search results (auto-generated from product name if empty)',
                validation: [
                    { type: 'max', value: 60, message: 'SEO title should be less than 60 characters' }
                ],
                width: 'full',
                order: 1
            },
            {
                id: 'seoDescription',
                name: 'seoDescription',
                label: 'SEO Description',
                type: 'textarea',
                placeholder: 'Brief description for search engines',
                description: 'Description that appears in search results (auto-generated if empty)',
                validation: [
                    { type: 'max', value: 160, message: 'SEO description should be less than 160 characters' }
                ],
                width: 'full',
                order: 2
            },
            {
                id: 'seoKeywords',
                name: 'seoKeywords',
                label: 'SEO Keywords',
                type: 'tags',
                placeholder: 'Add relevant keywords...',
                description: 'Keywords to help search engines understand your product',
                validation: [
                    { type: 'max', value: 15, message: 'Maximum 15 keywords allowed' }
                ],
                width: 'full',
                order: 3
            }
        ];

        return {
            id: 'seo',
            title: 'SEO & Discoverability',
            description: 'Optimize your product for search engines',
            icon: 'search',
            fields,
            collapsible: true,
            defaultCollapsed: true,
            order: 5
        };
    }

    /**
     * Generate advanced settings section
     */
    private generateAdvancedSettingsSection(category: ProductCategory): FormSection {
        const fields: FormFieldConfig[] = [
            {
                id: 'status',
                name: 'status',
                label: 'Publication Status',
                type: 'select',
                options: [
                    { value: 'draft', label: 'Draft', description: 'Not visible to public' },
                    { value: 'published', label: 'Published', description: 'Visible to public' },
                    { value: 'archived', label: 'Archived', description: 'Hidden but preserved' }
                ],
                defaultValue: 'draft',
                required: true,
                width: 'half',
                order: 1
            },
            {
                id: 'isFeatured',
                name: 'isFeatured',
                label: 'Featured Product',
                type: 'toggle',
                description: 'Highlight this product in featured sections',
                defaultValue: false,
                width: 'half',
                order: 2
            },
            {
                id: 'allowComments',
                name: 'allowComments',
                label: 'Allow Comments',
                type: 'toggle',
                description: 'Let users comment on this product',
                defaultValue: true,
                width: 'half',
                order: 3
            },
            {
                id: 'allowReviews',
                name: 'allowReviews',
                label: 'Allow Reviews',
                type: 'toggle',
                description: 'Let users review and rate this product',
                defaultValue: true,
                width: 'half',
                order: 4
            }
        ];

        return {
            id: 'advanced',
            title: 'Advanced Settings',
            description: 'Additional configuration options',
            icon: 'settings',
            fields,
            collapsible: true,
            defaultCollapsed: true,
            order: 6
        };
    }

    /**
     * Validate form data against schema
     */
    validateFormData(data: Partial<ProductFormData>, categoryId: string): { success: boolean; errors: Record<string, string[]> } {
        try {
            const category = getCategoryById(categoryId);
            if (!category) {
                return { success: false, errors: { category: ['Invalid category'] } };
            }

            // Get base schema
            const baseSchema = this.getBaseValidationSchema();

            // Get category-specific schema
            const categorySchema = this.getCategoryValidationSchema(categoryId);

            // Merge schemas
            const fullSchema = baseSchema.merge(categorySchema);

            // Validate
            fullSchema.parse(data);

            return { success: true, errors: {} };
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors: Record<string, string[]> = {};
                error.errors.forEach(err => {
                    const path = err.path.join('.');
                    if (!errors[path]) {
                        errors[path] = [];
                    }
                    errors[path].push(err.message);
                });
                return { success: false, errors };
            }

            return { success: false, errors: { general: ['Validation failed'] } };
        }
    }

    /**
     * Get base validation schema
     */
    private getBaseValidationSchema() {
        return z.object({
            name: z.string().min(1).max(100),
            slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
            shortDescription: z.string().max(200).optional(),
            description: z.string().min(10).optional(),
            categoryId: z.string().min(1),
            pricingType: z.enum(['free', 'one_time', 'subscription', 'bundle']),
            price: z.number().min(0).max(999999),
            currency: z.string().length(3),
            features: z.array(z.string()).max(20),
            tags: z.array(z.string()).max(10),
            seoKeywords: z.array(z.string()).max(15),
            status: z.enum(['draft', 'published', 'archived']),
            isFeatured: z.boolean(),
            allowComments: z.boolean(),
            allowReviews: z.boolean(),
        });
    }

    /**
     * Get category-specific validation schema
     */
    private getCategoryValidationSchema(categoryId: string) {
        // Return appropriate schema based on category
        // This would be expanded based on actual category requirements
        return z.object({});
    }
}

// Export singleton instance
export const formGenerator = FormGenerator.getInstance();