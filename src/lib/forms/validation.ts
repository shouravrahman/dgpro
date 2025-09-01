/**
 * Form Validation System
 * Comprehensive validation with XSS protection and sanitization
 */

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import type { ValidationRule, ConditionalLogic } from '@/types/product-forms';

export class FormValidator {
    private static instance: FormValidator;

    public static getInstance(): FormValidator {
        if (!FormValidator.instance) {
            FormValidator.instance = new FormValidator();
        }
        return FormValidator.instance;
    }

    /**
     * Sanitize input to prevent XSS attacks
     */
    sanitizeInput(input: any, type: 'text' | 'html' | 'url' | 'email' = 'text'): any {
        if (typeof input !== 'string') {
            return input;
        }

        switch (type) {
            case 'html':
                return DOMPurify.sanitize(input, {
                    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
                    ALLOWED_ATTR: ['href', 'target', 'rel'],
                    ALLOW_DATA_ATTR: false
                });

            case 'url':
                // Basic URL sanitization
                try {
                    const url = new URL(input);
                    if (!['http:', 'https:'].includes(url.protocol)) {
                        return '';
                    }
                    return url.toString();
                } catch {
                    return '';
                }

            case 'email':
                // Basic email sanitization
                return input.toLowerCase().trim().replace(/[^\w@.-]/g, '');

            case 'text':
            default:
                // Remove HTML tags and dangerous characters
                return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
        }
    }

    /**
     * Sanitize entire form data object
     */
    sanitizeFormData(data: Record<string, any>, fieldTypes: Record<string, string> = {}): Record<string, any> {
        const sanitized: Record<string, any> = {};

        for (const [key, value] of Object.entries(data)) {
            const fieldType = fieldTypes[key] || 'text';

            if (Array.isArray(value)) {
                sanitized[key] = value.map(item =>
                    typeof item === 'string' ? this.sanitizeInput(item, fieldType as any) : item
                );
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = this.sanitizeFormData(value, fieldTypes);
            } else {
                sanitized[key] = this.sanitizeInput(value, fieldType as any);
            }
        }

        return sanitized;
    }

    /**
     * Validate field value against validation rules
     */
    validateField(
        value: any,
        rules: ValidationRule[],
        formData: Record<string, any> = {}
    ): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        for (const rule of rules) {
            // Check if rule should be applied based on conditional logic
            if (rule.condition && !this.evaluateCondition(rule.condition, formData)) {
                continue;
            }

            const error = this.validateRule(value, rule);
            if (error) {
                errors.push(error);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate individual rule
     */
    private validateRule(value: any, rule: ValidationRule): string | null {
        switch (rule.type) {
            case 'required':
                if (this.isEmpty(value)) {
                    return rule.message;
                }
                break;

            case 'min':
                if (typeof value === 'string' && value.length < rule.value) {
                    return rule.message;
                }
                if (typeof value === 'number' && value < rule.value) {
                    return rule.message;
                }
                if (Array.isArray(value) && value.length < rule.value) {
                    return rule.message;
                }
                break;

            case 'max':
                if (typeof value === 'string' && value.length > rule.value) {
                    return rule.message;
                }
                if (typeof value === 'number' && value > rule.value) {
                    return rule.message;
                }
                if (Array.isArray(value) && value.length > rule.value) {
                    return rule.message;
                }
                break;

            case 'pattern':
                if (typeof value === 'string') {
                    const regex = new RegExp(rule.value);
                    if (!regex.test(value)) {
                        return rule.message;
                    }
                }
                break;

            case 'file-size':
                if (value && typeof value === 'object' && 'size' in value) {
                    if (value.size > rule.value) {
                        return rule.message;
                    }
                }
                break;

            case 'file-type':
                if (value && typeof value === 'object' && 'type' in value) {
                    const allowedTypes = Array.isArray(rule.value) ? rule.value : [rule.value];
                    if (!allowedTypes.includes(value.type)) {
                        return rule.message;
                    }
                }
                break;

            case 'custom':
                if (typeof rule.value === 'function') {
                    const result = rule.value(value);
                    if (result !== true) {
                        return typeof result === 'string' ? result : rule.message;
                    }
                }
                break;
        }

        return null;
    }

    /**
     * Check if value is empty
     */
    private isEmpty(value: any): boolean {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }

    /**
     * Evaluate conditional logic
     */
    evaluateCondition(condition: ConditionalLogic, formData: Record<string, any>): boolean {
        const fieldValue = formData[condition.field];

        switch (condition.operator) {
            case 'equals':
                return fieldValue === condition.value;

            case 'not-equals':
                return fieldValue !== condition.value;

            case 'contains':
                if (typeof fieldValue === 'string') {
                    return fieldValue.includes(condition.value);
                }
                if (Array.isArray(fieldValue)) {
                    return fieldValue.includes(condition.value);
                }
                return false;

            case 'not-contains':
                if (typeof fieldValue === 'string') {
                    return !fieldValue.includes(condition.value);
                }
                if (Array.isArray(fieldValue)) {
                    return !fieldValue.includes(condition.value);
                }
                return true;

            case 'greater':
                return typeof fieldValue === 'number' && fieldValue > condition.value;

            case 'less':
                return typeof fieldValue === 'number' && fieldValue < condition.value;

            case 'in':
                return Array.isArray(condition.value) && condition.value.includes(fieldValue);

            case 'not-in':
                return Array.isArray(condition.value) && !condition.value.includes(fieldValue);

            default:
                return true;
        }
    }

    /**
     * Create Zod schema from validation rules
     */
    createZodSchema(rules: ValidationRule[]): z.ZodSchema {
        let schema: z.ZodSchema = z.any();

        for (const rule of rules) {
            switch (rule.type) {
                case 'required':
                    // This is handled at the field level
                    break;

                case 'min':
                    if (schema instanceof z.ZodString) {
                        schema = schema.min(rule.value, rule.message);
                    } else if (schema instanceof z.ZodNumber) {
                        schema = schema.min(rule.value, rule.message);
                    } else if (schema instanceof z.ZodArray) {
                        schema = schema.min(rule.value, rule.message);
                    }
                    break;

                case 'max':
                    if (schema instanceof z.ZodString) {
                        schema = schema.max(rule.value, rule.message);
                    } else if (schema instanceof z.ZodNumber) {
                        schema = schema.max(rule.value, rule.message);
                    } else if (schema instanceof z.ZodArray) {
                        schema = schema.max(rule.value, rule.message);
                    }
                    break;

                case 'pattern':
                    if (schema instanceof z.ZodString) {
                        schema = schema.regex(new RegExp(rule.value), rule.message);
                    }
                    break;
            }
        }

        return schema;
    }

    /**
     * Validate file upload
     */
    validateFile(
        file: File,
        config: {
            maxSize?: number;
            allowedTypes?: string[];
            allowedExtensions?: string[];
        }
    ): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Check file size
        if (config.maxSize && file.size > config.maxSize) {
            const sizeMB = Math.round(config.maxSize / (1024 * 1024));
            errors.push(`File size must be less than ${sizeMB}MB`);
        }

        // Check file type
        if (config.allowedTypes && !config.allowedTypes.includes(file.type)) {
            errors.push(`File type ${file.type} is not allowed`);
        }

        // Check file extension
        if (config.allowedExtensions) {
            const extension = '.' + file.name.split('.').pop()?.toLowerCase();
            if (!config.allowedExtensions.includes(extension)) {
                errors.push(`File extension ${extension} is not allowed`);
            }
        }

        // Check for potentially dangerous files
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.jar'];
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (dangerousExtensions.includes(extension)) {
            errors.push('This file type is not allowed for security reasons');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Generate slug from text
     */
    generateSlug(text: string): string {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }

    /**
     * Validate email format
     */
    validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate URL format
     */
    validateUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate phone number format
     */
    validatePhone(phone: string): boolean {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Check password strength
     */
    checkPasswordStrength(password: string): {
        score: number;
        feedback: string[];
        isStrong: boolean;
    } {
        const feedback: string[] = [];
        let score = 0;

        if (password.length >= 8) {
            score += 1;
        } else {
            feedback.push('Password should be at least 8 characters long');
        }

        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Password should contain lowercase letters');
        }

        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Password should contain uppercase letters');
        }

        if (/\d/.test(password)) {
            score += 1;
        } else {
            feedback.push('Password should contain numbers');
        }

        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Password should contain special characters');
        }

        return {
            score,
            feedback,
            isStrong: score >= 4
        };
    }

    /**
     * Rate limit validation attempts
     */
    private validationAttempts = new Map<string, { count: number; lastAttempt: number }>();

    checkRateLimit(identifier: string, maxAttempts = 10, windowMs = 60000): boolean {
        const now = Date.now();
        const attempts = this.validationAttempts.get(identifier);

        if (!attempts) {
            this.validationAttempts.set(identifier, { count: 1, lastAttempt: now });
            return true;
        }

        if (now - attempts.lastAttempt > windowMs) {
            // Reset window
            this.validationAttempts.set(identifier, { count: 1, lastAttempt: now });
            return true;
        }

        if (attempts.count >= maxAttempts) {
            return false;
        }

        attempts.count++;
        attempts.lastAttempt = now;
        return true;
    }
}

// Export singleton instance
export const formValidator = FormValidator.getInstance();

// Common validation schemas
export const commonSchemas = {
    email: z.string().email('Invalid email format'),
    url: z.string().url('Invalid URL format'),
    phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Invalid phone number format'),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed'),
    currency: z.number().min(0, 'Amount must be positive').max(999999, 'Amount is too large'),
    tags: z.array(z.string()).max(20, 'Maximum 20 tags allowed'),
    password: z.string().min(8, 'Password must be at least 8 characters'),

    // File validation schemas
    imageFile: z.object({
        name: z.string(),
        size: z.number().max(10 * 1024 * 1024, 'Image must be less than 10MB'),
        type: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp)$/, 'Only JPG, PNG, GIF, and WebP images allowed')
    }),

    documentFile: z.object({
        name: z.string(),
        size: z.number().max(50 * 1024 * 1024, 'Document must be less than 50MB'),
        type: z.string().regex(/^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|text\/plain)$/, 'Only PDF, DOC, DOCX, and TXT files allowed')
    }),

    archiveFile: z.object({
        name: z.string(),
        size: z.number().max(500 * 1024 * 1024, 'Archive must be less than 500MB'),
        type: z.string().regex(/^(application\/zip|application\/x-rar-compressed|application\/x-7z-compressed)$/, 'Only ZIP, RAR, and 7Z archives allowed')
    })
};