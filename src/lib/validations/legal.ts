import { z } from 'zod';

// License validation schemas
export const createLicenseSchema = z.object({
    product_id: z.string().uuid(),
    license_type_id: z.string().uuid(),
    custom_terms: z.string().optional(),
    price: z.number().min(0).optional(),
    is_default: z.boolean().optional(),
});

export const updateLicenseSchema = z.object({
    custom_terms: z.string().optional(),
    price: z.number().min(0).optional(),
    is_default: z.boolean().optional(),
});

// Legal document validation schemas
export const generateDocumentSchema = z.object({
    template_id: z.string().uuid(),
    variables: z.record(z.any()),
    product_id: z.string().uuid().optional(),
});

export const createDocumentTemplateSchema = z.object({
    name: z.string().min(1).max(200),
    document_type: z.enum([
        'terms_of_service',
        'privacy_policy',
        'license_agreement',
        'copyright_notice',
        'dmca_policy',
        'refund_policy',
        'user_agreement',
    ]),
    content: z.string().min(100),
    variables: z.record(z.string()).optional(),
    jurisdiction: z.string().min(2).max(10),
    language: z.string().min(2).max(5),
    is_premium: z.boolean().optional(),
});

// GDPR compliance validation schemas
export const gdprConsentSchema = z.object({
    consent_given: z.boolean(),
    data_processing_purposes: z.record(z.any()),
    marketing_consent: z.boolean(),
    analytics_consent: z.boolean(),
    third_party_sharing_consent: z.boolean(),
});

export const dataProcessingActivitySchema = z.object({
    activity_type: z.enum(['collection', 'processing', 'storage', 'sharing', 'deletion']),
    data_category: z.enum(['personal', 'sensitive', 'behavioral', 'technical', 'financial']),
    purpose: z.string().min(10).max(500),
    legal_basis: z.enum([
        'consent',
        'contract',
        'legal_obligation',
        'legitimate_interest',
        'vital_interests',
        'public_task',
    ]),
    retention_period: z.number().min(1).max(3650).optional(), // Max 10 years
    third_parties: z.array(z.string()).optional(),
    security_measures: z.record(z.any()).optional(),
});

// Copyright protection validation schemas
export const createCopyrightProtectionSchema = z.object({
    product_id: z.string().uuid(),
    copyright_notice: z.string().min(10).max(1000),
    registration_number: z.string().optional(),
    registration_date: z.string().optional(),
    protection_level: z.enum(['basic', 'standard', 'premium', 'enterprise']),
    dmca_agent_info: z.record(z.any()).optional(),
    watermark_settings: z.record(z.any()).optional(),
    monitoring_enabled: z.boolean().optional(),
});

export const reportViolationSchema = z.object({
    copyright_id: z.string().uuid(),
    violation_url: z.string().url().optional(),
    violation_type: z.enum([
        'unauthorized_use',
        'plagiarism',
        'redistribution',
        'modification',
        'commercial_misuse',
    ]),
    description: z.string().min(20).max(2000),
    evidence: z.record(z.any()).optional(),
});

// Dispute resolution validation schemas
export const createDisputeSchema = z.object({
    respondent_id: z.string().uuid(),
    product_id: z.string().uuid().optional(),
    dispute_type: z.enum(['copyright', 'licensing', 'contract', 'refund', 'quality', 'delivery']),
    description: z.string().min(50).max(5000),
    evidence: z.record(z.any()).optional(),
});

export const updateDisputeSchema = z.object({
    status: z.enum(['open', 'mediation', 'arbitration', 'resolved', 'closed', 'escalated']).optional(),
    mediator_id: z.string().uuid().optional(),
    resolution: z.string().min(10).max(2000).optional(),
});

// White labeling validation schemas
export const whiteLabelSetupSchema = z.object({
    domain: z.string().min(3).max(100).regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
    branding: z.object({
        logo_url: z.string().url().optional(),
        primary_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        font_family: z.string().optional(),
        company_name: z.string().min(1).max(100),
    }),
    custom_terms: z.record(z.any()).optional(),
    revenue_share_percentage: z.number().min(0).max(1).optional(),
    features_enabled: z.record(z.boolean()).optional(),
});

export const updateWhiteLabelSchema = z.object({
    branding: z.object({
        logo_url: z.string().url().optional(),
        primary_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        font_family: z.string().optional(),
        company_name: z.string().min(1).max(100).optional(),
    }).optional(),
    custom_terms: z.record(z.any()).optional(),
    revenue_share_percentage: z.number().min(0).max(1).optional(),
    features_enabled: z.record(z.boolean()).optional(),
    custom_css: z.string().optional(),
    custom_js: z.string().optional(),
    is_active: z.boolean().optional(),
});

// Legal compliance audit validation schemas
export const createAuditSchema = z.object({
    audit_type: z.enum(['gdpr', 'copyright', 'licensing', 'terms', 'security', 'compliance']),
    user_id: z.string().uuid().optional(), // For admin-initiated audits
});

export const updateAuditSchema = z.object({
    compliance_score: z.number().min(0).max(100).optional(),
    findings: z.record(z.any()).optional(),
    recommendations: z.record(z.any()).optional(),
    action_items: z.record(z.any()).optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
    next_audit_date: z.string().optional(),
});

// Query parameter validation schemas
export const legalQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sort: z.enum(['created_at', 'updated_at', 'name', 'status']).default('created_at'),
    order: z.enum(['asc', 'desc']).default('desc'),
    status: z.string().optional(),
    type: z.string().optional(),
    search: z.string().optional(),
});

export const disputeQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    status: z.enum(['open', 'mediation', 'arbitration', 'resolved', 'closed', 'escalated']).optional(),
    dispute_type: z.enum(['copyright', 'licensing', 'contract', 'refund', 'quality', 'delivery']).optional(),
    sort: z.enum(['created_at', 'updated_at', 'case_number']).default('created_at'),
    order: z.enum(['asc', 'desc']).default('desc'),
});

export const violationQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    status: z.enum(['pending', 'investigating', 'resolved', 'dismissed', 'escalated']).optional(),
    violation_type: z.enum([
        'unauthorized_use',
        'plagiarism',
        'redistribution',
        'modification',
        'commercial_misuse',
    ]).optional(),
    sort: z.enum(['created_at', 'updated_at']).default('created_at'),
    order: z.enum(['asc', 'desc']).default('desc'),
});

// Export all schemas
export type CreateLicenseRequest = z.infer<typeof createLicenseSchema>;
export type UpdateLicenseRequest = z.infer<typeof updateLicenseSchema>;
export type GenerateDocumentRequest = z.infer<typeof generateDocumentSchema>;
export type CreateDocumentTemplateRequest = z.infer<typeof createDocumentTemplateSchema>;
export type GDPRConsentRequest = z.infer<typeof gdprConsentSchema>;
export type DataProcessingActivityRequest = z.infer<typeof dataProcessingActivitySchema>;
export type CreateCopyrightProtectionRequest = z.infer<typeof createCopyrightProtectionSchema>;
export type ReportViolationRequest = z.infer<typeof reportViolationSchema>;
export type CreateDisputeRequest = z.infer<typeof createDisputeSchema>;
export type UpdateDisputeRequest = z.infer<typeof updateDisputeSchema>;
export type WhiteLabelSetupRequest = z.infer<typeof whiteLabelSetupSchema>;
export type UpdateWhiteLabelRequest = z.infer<typeof updateWhiteLabelSchema>;
export type CreateAuditRequest = z.infer<typeof createAuditSchema>;
export type UpdateAuditRequest = z.infer<typeof updateAuditSchema>;
export type LegalQueryParams = z.infer<typeof legalQuerySchema>;
export type DisputeQueryParams = z.infer<typeof disputeQuerySchema>;
export type ViolationQueryParams = z.infer<typeof violationQuerySchema>;