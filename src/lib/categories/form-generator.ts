/**
 * Dynamic Form Generation System
 * Generates forms based on category requirements and templates
 */

import { z } from 'zod';
import { ProductCategory, FormField, FieldValidation, ConditionalLogic } from './types';
import { getCategoryById } from './definitions';

export interface GeneratedForm {
    schema: z.ZodSchema;
    fields: FormFieldConfig[];
    sections: FormSection[];
    validation: ValidationConfig;
}

export interface FormFieldConfig extends FormField {
    component: string;
    props: Record<string, any>;
    dependencies: string[];
    validationSchema: z.ZodSchema;
}

export interface FormSection {
    id: string;
    title: string;
    description?: string;
    fields: string[];
    order: number;
    collapsible: boolean;
    required: boolean;
}

export interface ValidationConfig {
    schema: z.ZodSchema;
    rules: ValidationRule[];
    customValidators: Record<string, (value: any, formData: any) => boolean | string>;
}

export interface ValidationRule {
    field: string;
    validator: string;
    message: string;
    params?: Record<string, any>;
}

export class FormGenerator {
    /**
     * Generate a complete form configuration for a category
     */
    static generateForm(categoryId: string, templateId?: string): GeneratedForm {
        const category = getCategoryById(categoryId);
        if (!category) {
            throw new Error(`Category not found: ${categoryId}`);
        }

        const fields = this.generateFields(category, templateId);
        const sections = this.generateSections(category, fields);
        const validation = this.generateValidation(category, fields);
        const schema = this.generateZodSchema(fields);

        return {
            schema,
            fields,
            sections,
            validation
        };
    }

    /**
     * Generate field configurations from category requirements
     */
    private static generateFields(category: ProductCategory, templateId?: string): FormFieldConfig[] {
        const allFields = [...category.requirements.requiredFields, ...category.requirements.optionalFields];
        const template = templateId ? category.templates.find(t => t.id === templateId) : null;

        return allFields.map(field => {
            const fieldConfig: FormFieldConfig = {
                ...field,
                component: this.getFieldComponent(field.type),
                props: this.generateFieldProps(field, template),
                dependencies: this.extractDependencies(field),
                validationSchema: this.createFieldValidationSchema(field)
            };

            return fieldConfig;
        });
    }

    /**
     * Generate form sections for better organization
     */
    private static generateSections(category: ProductCategory, fields: FormFieldConfig[]): FormSection[] {
        const sections: FormSection[] = [
            {
                id: 'basic-info',
                title: 'Basic Information',
                description: 'Essential details about your product',
                fields: fields.filter(f => ['title', 'name', 'description'].some(basic => f.id.includes(basic))).map(f => f.id),
                order: 1,
                collapsible: false,
                required: true
            },
            {
                id: 'category-specific',
                title: 'Category Details',
                description: `Specific requirements for ${category.name}`,
                fields: fields.filter(f => f.id.includes('category') || f.id.includes('type')).map(f => f.id),
                order: 2,
                collapsible: false,
                required: true
            },
            {
                id: 'files-media',
                title: 'Files & Media',
                description: 'Upload your product files and media assets',
                fields: fields.filter(f => f.type === 'file').map(f => f.id),
                order: 3,
                collapsible: false,
                required: true
            },
            {
                id: 'additional-info',
                title: 'Additional Information',
                description: 'Optional details to enhance your product listing',
                fields: fields.filter(f => !f.validation.required && !['file'].includes(f.type)).map(f => f.id),
                order: 4,
                collapsible: true,
                required: false
            }
        ];

        // Filter out empty sections
        return sections.filter(section => section.fields.length > 0);
    }

    /**
     * Generate validation configuration
     */
    private static generateValidation(category: ProductCategory, fields: FormFieldConfig[]): ValidationConfig {
        const rules = category.requirements.validationRules.map(rule => ({
            field: rule.field,
            validator: rule.rule,
            message: rule.message,
            params: rule.params || {}
        }));

        const customValidators = this.createCustomValidators(category);
        const schema = this.generateZodSchema(fields);

        return {
            schema,
            rules,
            customValidators
        };
    }

    /**
     * Generate Zod schema for form validation
     */
    private static generateZodSchema(fields: FormFieldConfig[]): z.ZodSchema {
        const schemaFields: Record<string, z.ZodSchema> = {};

        fields.forEach(field => {
            schemaFields[field.name] = field.validationSchema;
        });

        return z.object(schemaFields);
    }

    /**
     * Create field-specific validation schema
     */
    private static createFieldValidationSchema(field: FormField): z.ZodSchema {
        let schema: z.ZodSchema;

        switch (field.type) {
            case 'text':
            case 'textarea':
            case 'url':
            case 'email':
                schema = z.string();
                if (field.validation.minLength) {
                    schema = (schema as z.ZodString).min(field.validation.minLength, `Minimum ${field.validation.minLength} characters required`);
                }
                if (field.validation.maxLength) {
                    schema = (schema as z.ZodString).max(field.validation.maxLength, `Maximum ${field.validation.maxLength} characters allowed`);
                }
                if (field.validation.pattern) {
                    schema = (schema as z.ZodString).regex(new RegExp(field.validation.pattern), 'Invalid format');
                }
                if (field.type === 'email') {
                    schema = (schema as z.ZodString).email('Invalid email address');
                }
                if (field.type === 'url') {
                    schema = (schema as z.ZodString).url('Invalid URL format');
                }
                break;

            case 'number':
                schema = z.number();
                if (field.validation.min !== undefined) {
                    schema = (schema as z.ZodNumber).min(field.validation.min, `Minimum value is ${field.validation.min}`);
                }
                if (field.validation.max !== undefined) {
                    schema = (schema as z.ZodNumber).max(field.validation.max, `Maximum value is ${field.validation.max}`);
                }
                break;

            case 'boolean':
                schema = z.boolean();
                break;

            case 'date':
                schema = z.date();
                break;

            case 'select':
                if (field.options) {
                    const validValues = field.options.map(opt => opt.value);
                    schema = z.enum(validValues as [string, ...string[]]);
                } else {
                    schema = z.string();
                }
                break;

            case 'multiselect':
                if (field.options) {
                    const validValues = field.options.map(opt => opt.value);
                    schema = z.array(z.enum(validValues as [string, ...string[]]));
                } else {
                    schema = z.array(z.string());
                }
                break;

            case 'file':
                schema = z.any(); // File validation handled separately
                break;

            default:
                schema = z.string();
        }

        // Apply required/optional
        if (!field.validation.required) {
            schema = schema.optional();
        }

        return schema;
    }

    /**
     * Get appropriate component for field type
     */
    private static getFieldComponent(type: string): string {
        const componentMap: Record<string, string> = {
            'text': 'TextInput',
            'textarea': 'TextareaInput',
            'number': 'NumberInput',
            'select': 'SelectInput',
            'multiselect': 'MultiSelectInput',
            'file': 'FileUploadInput',
            'url': 'URLInput',
            'email': 'EmailInput',
            'date': 'DateInput',
            'boolean': 'CheckboxInput'
        };

        return componentMap[type] || 'TextInput';
    }

    /**
     * Generate props for field component
     */
    private static generateFieldProps(field: FormField, template: any): Record<string, any> {
        const props: Record<string, any> = {
            label: field.label,
            placeholder: field.placeholder,
            description: field.description,
            required: field.validation.required,
            options: field.options || []
        };

        // Add template default values
        if (template?.defaultValues?.[field.name]) {
            props.defaultValue = template.defaultValues[field.name];
        }

        // Add field-specific props
        switch (field.type) {
            case 'textarea':
                props.rows = 4;
                props.maxLength = field.validation.maxLength;
                break;
            case 'number':
                props.min = field.validation.min;
                props.max = field.validation.max;
                break;
            case 'file':
                props.accept = this.getFileAcceptTypes(field);
                props.multiple = true;
                break;
        }

        return props;
    }

    /**
     * Extract field dependencies for conditional logic
     */
    private static extractDependencies(field: FormField): string[] {
        const dependencies: string[] = [];

        if (field.conditional) {
            dependencies.push(field.conditional.dependsOn);
        }

        return dependencies;
    }

    /**
     * Create custom validators for complex validation rules
     */
    private static createCustomValidators(category: ProductCategory): Record<string, (value: any, formData: any) => boolean | string> {
        const validators: Record<string, (value: any, formData: any) => boolean | string> = {};

        // Unique check validator
        validators.unique_check = (value: string, formData: any) => {
            // This would typically check against a database
            // For now, return true (implement actual check in component)
            return true;
        };

        // File count validator
        validators.file_count_min = (value: any[], formData: any) => {
            const minCount = 1; // Get from validation rule params
            if (!value || value.length < minCount) {
                return `At least ${minCount} file(s) required`;
            }
            return true;
        };

        // URL accessibility validator
        validators.url_accessible = async (value: string, formData: any) => {
            if (!value) return true;

            try {
                // This would typically make a HEAD request to check URL
                // For now, just validate URL format
                new URL(value);
                return true;
            } catch {
                return 'Invalid or inaccessible URL';
            }
        };

        return validators;
    }

    /**
     * Get file accept types for file inputs
     */
    private static getFileAcceptTypes(field: FormField): string {
        // This would be enhanced to use category file type requirements
        const commonTypes: Record<string, string> = {
            'design_files': '.ai,.psd,.sketch,.fig,.svg,.eps',
            'media_files': '.jpg,.jpeg,.png,.gif,.mp4,.mov,.mp3,.wav',
            'document_files': '.pdf,.docx,.xlsx,.pptx,.txt',
            'template_files': '.docx,.xlsx,.pptx,.pdf',
            'source_files': '.zip,.tar.gz,.rar'
        };

        return commonTypes[field.name] || '*';
    }

    /**
     * Evaluate conditional logic for field visibility
     */
    static evaluateConditional(conditional: ConditionalLogic, formData: Record<string, any>): boolean {
        const dependentValue = formData[conditional.dependsOn];

        switch (conditional.condition) {
            case 'equals':
                return dependentValue === conditional.value;
            case 'not_equals':
                return dependentValue !== conditional.value;
            case 'contains':
                return Array.isArray(dependentValue)
                    ? dependentValue.includes(conditional.value)
                    : String(dependentValue).includes(String(conditional.value));
            case 'greater_than':
                return Number(dependentValue) > Number(conditional.value);
            case 'less_than':
                return Number(dependentValue) < Number(conditional.value);
            default:
                return true;
        }
    }

    /**
     * Get template-specific form modifications
     */
    static getTemplateModifications(categoryId: string, templateId: string): Partial<GeneratedForm> {
        const category = getCategoryById(categoryId);
        const template = category?.templates.find(t => t.id === templateId);

        if (!template) {
            return {};
        }

        // Return template-specific field modifications, default values, etc.
        return {
            // Add template-specific modifications here
        };
    }
}

// Export utility functions
export const formGenerator = FormGenerator;