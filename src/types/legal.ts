// Legal and Licensing System Types

export interface LicenseType {
    id: string;
    name: string;
    description: string;
    terms: string;
    commercial_use: boolean;
    modification_allowed: boolean;
    redistribution_allowed: boolean;
    attribution_required: boolean;
    price_modifier: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ProductLicense {
    id: string;
    product_id: string;
    license_type_id: string;
    custom_terms?: string;
    price: number;
    is_default: boolean;
    created_at: string;
    updated_at: string;
    license_type?: LicenseType;
}

export interface LegalDocument {
    id: string;
    user_id: string;
    product_id?: string;
    document_type: DocumentType;
    title: string;
    content: string;
    template_id?: string;
    variables?: Record<string, any>;
    version: number;
    is_active: boolean;
    generated_at: string;
    expires_at?: string;
    created_at: string;
}

export interface LegalDocumentTemplate {
    id: string;
    name: string;
    document_type: DocumentType;
    content: string;
    variables?: Record<string, any>;
    jurisdiction: string;
    language: string;
    is_premium: boolean;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface GDPRCompliance {
    id: string;
    user_id: string;
    consent_given: boolean;
    consent_date?: string;
    data_processing_purposes?: Record<string, any>;
    marketing_consent: boolean;
    analytics_consent: boolean;
    third_party_sharing_consent: boolean;
    withdrawal_date?: string;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    updated_at: string;
}

export interface DataProcessingActivity {
    id: string;
    user_id: string;
    activity_type: DataActivityType;
    data_category: DataCategory;
    purpose: string;
    legal_basis: LegalBasis;
    retention_period?: number;
    third_parties?: string[];
    security_measures?: Record<string, any>;
    created_at: string;
}

export interface CopyrightProtection {
    id: string;
    product_id: string;
    owner_id: string;
    copyright_notice: string;
    registration_number?: string;
    registration_date?: string;
    protection_level: ProtectionLevel;
    dmca_agent_info?: Record<string, any>;
    watermark_settings?: Record<string, any>;
    monitoring_enabled: boolean;
    created_at: string;
    updated_at: string;
}

export interface CopyrightViolation {
    id: string;
    copyright_id: string;
    reported_by: string;
    violation_url?: string;
    violation_type: ViolationType;
    description: string;
    evidence?: Record<string, any>;
    status: ViolationStatus;
    resolution?: string;
    resolved_by?: string;
    resolved_at?: string;
    created_at: string;
}

export interface DisputeResolution {
    id: string;
    case_number: string;
    complainant_id: string;
    respondent_id: string;
    product_id?: string;
    dispute_type: DisputeType;
    description: string;
    evidence?: Record<string, any>;
    status: DisputeStatus;
    mediator_id?: string;
    resolution?: string;
    resolution_date?: string;
    created_at: string;
    updated_at: string;
}

export interface LegalComplianceAudit {
    id: string;
    user_id: string;
    audit_type: AuditType;
    compliance_score?: number;
    findings?: Record<string, any>;
    recommendations?: Record<string, any>;
    action_items?: Record<string, any>;
    status: AuditStatus;
    auditor_id?: string;
    audit_date: string;
    next_audit_date?: string;
}

export interface WhiteLabelConfig {
    id: string;
    client_id: string;
    domain: string;
    branding?: Record<string, any>;
    custom_terms?: Record<string, any>;
    revenue_share_percentage: number;
    features_enabled?: Record<string, any>;
    custom_css?: string;
    custom_js?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Enums and Types
export type DocumentType =
    | 'terms_of_service'
    | 'privacy_policy'
    | 'license_agreement'
    | 'copyright_notice'
    | 'dmca_policy'
    | 'refund_policy'
    | 'user_agreement';

export type DataActivityType =
    | 'collection'
    | 'processing'
    | 'storage'
    | 'sharing'
    | 'deletion';

export type DataCategory =
    | 'personal'
    | 'sensitive'
    | 'behavioral'
    | 'technical'
    | 'financial';

export type LegalBasis =
    | 'consent'
    | 'contract'
    | 'legal_obligation'
    | 'legitimate_interest'
    | 'vital_interests'
    | 'public_task';

export type ProtectionLevel =
    | 'basic'
    | 'standard'
    | 'premium'
    | 'enterprise';

export type ViolationType =
    | 'unauthorized_use'
    | 'plagiarism'
    | 'redistribution'
    | 'modification'
    | 'commercial_misuse';

export type ViolationStatus =
    | 'pending'
    | 'investigating'
    | 'resolved'
    | 'dismissed'
    | 'escalated';

export type DisputeType =
    | 'copyright'
    | 'licensing'
    | 'contract'
    | 'refund'
    | 'quality'
    | 'delivery';

export type DisputeStatus =
    | 'open'
    | 'mediation'
    | 'arbitration'
    | 'resolved'
    | 'closed'
    | 'escalated';

export type AuditType =
    | 'gdpr'
    | 'copyright'
    | 'licensing'
    | 'terms'
    | 'security'
    | 'compliance';

export type AuditStatus =
    | 'pending'
    | 'in_progress'
    | 'completed'
    | 'failed';

// Request/Response Types
export interface CreateLicenseRequest {
    product_id: string;
    license_type_id: string;
    custom_terms?: string;
    price?: number;
    is_default?: boolean;
}

export interface GenerateDocumentRequest {
    template_id: string;
    variables: Record<string, any>;
    product_id?: string;
}

export interface GDPRConsentRequest {
    consent_given: boolean;
    data_processing_purposes: Record<string, any>;
    marketing_consent: boolean;
    analytics_consent: boolean;
    third_party_sharing_consent: boolean;
}

export interface ReportViolationRequest {
    copyright_id: string;
    violation_url?: string;
    violation_type: ViolationType;
    description: string;
    evidence?: Record<string, any>;
}

export interface CreateDisputeRequest {
    respondent_id: string;
    product_id?: string;
    dispute_type: DisputeType;
    description: string;
    evidence?: Record<string, any>;
}

export interface WhiteLabelSetupRequest {
    domain: string;
    branding: Record<string, any>;
    custom_terms?: Record<string, any>;
    revenue_share_percentage?: number;
    features_enabled?: Record<string, any>;
}

// Utility Types
export interface LicenseComparison {
    license_type: LicenseType;
    features: string[];
    restrictions: string[];
    price: number;
    recommended?: boolean;
}

export interface ComplianceReport {
    overall_score: number;
    gdpr_compliance: boolean;
    copyright_protection: boolean;
    licensing_clarity: boolean;
    legal_documents_current: boolean;
    recommendations: string[];
    action_items: string[];
}

export interface LegalNotification {
    id: string;
    type: 'violation' | 'dispute' | 'compliance' | 'renewal';
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    action_required: boolean;
    deadline?: string;
    created_at: string;
}