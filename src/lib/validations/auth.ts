// Authentication Form Validation Schemas
// Comprehensive validation with security measures and user-friendly error messages

import { z } from 'zod';

// Password strength validation
const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

// Email validation with common domain checks
const emailSchema = z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .refine((email) => {
        // Check for common typos in email domains
        const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        const domain = email.split('@')[1]?.toLowerCase();
        if (!domain) return true;

        // Allow all domains, but could add specific validation if needed
        return true;
    }, 'Please check your email domain');

// Full name validation
const nameSchema = z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .refine((name) => name.trim().length > 0, 'Name cannot be empty');

// Login form schema
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
});

// Registration form schema
export const registerSchema = z
    .object({
        fullName: nameSchema,
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string().min(1, 'Please confirm your password'),
        acceptTerms: z.boolean().refine((val) => val === true, {
            message: 'You must accept the terms and conditions',
        }),
        marketingEmails: z.boolean().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

// Password reset request schema
export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

// Password reset schema
export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

// Profile update schema
export const updateProfileSchema = z.object({
    fullName: nameSchema,
    bio: z.string().max(500, 'Bio is too long').optional(),
    website: z
        .string()
        .url('Please enter a valid URL')
        .optional()
        .or(z.literal('')),
    location: z.string().max(100, 'Location is too long').optional(),
    skills: z.array(z.string()).max(20, 'Too many skills selected').optional(),
});

// Change password schema
export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: passwordSchema,
        confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: 'Passwords do not match',
        path: ['confirmNewPassword'],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: 'New password must be different from current password',
        path: ['newPassword'],
    });

// Email verification schema
export const verifyEmailSchema = z.object({
    token: z.string().min(1, 'Verification token is required'),
});

// Two-factor authentication setup schema
export const twoFactorSetupSchema = z.object({
    code: z
        .string()
        .length(6, 'Verification code must be 6 digits')
        .regex(/^\d+$/, 'Verification code must contain only numbers'),
});

// Account deletion schema
export const deleteAccountSchema = z.object({
    password: z.string().min(1, 'Password is required to delete account'),
    confirmation: z
        .string()
        .refine((val) => val === 'DELETE', {
            message: 'Please type "DELETE" to confirm account deletion',
        }),
});

// Export types for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type TwoFactorSetupFormData = z.infer<typeof twoFactorSetupSchema>;
export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

// Password strength checker utility
export function getPasswordStrength(password: string): {
    score: number;
    feedback: string[];
    color: 'red' | 'orange' | 'yellow' | 'green';
} {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score += 1;
    else feedback.push('Use at least 8 characters');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Add numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Add special characters');

    // Additional checks
    if (password.length >= 12) score += 1;
    if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters
    if (/^(password|123456|qwerty)/i.test(password)) score -= 2; // Common passwords

    const colors: Array<'red' | 'orange' | 'yellow' | 'green'> = ['red', 'red', 'orange', 'yellow', 'green', 'green'];
    const color = colors[Math.max(0, Math.min(score, colors.length - 1))];

    return { score: Math.max(0, score), feedback, color };
}

// Input sanitization utilities
export function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, ''); // Remove event handlers
}

export function sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
}

export function sanitizeName(name: string): string {
    return name
        .trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/[^\w\s'-]/g, ''); // Keep only letters, spaces, hyphens, and apostrophes
}