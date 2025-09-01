import { createClient } from '@/lib/supabase/server';
import type {
    LicenseType,
    ProductLicense,
    LegalDocument,
    LegalDocumentTemplate,
    GDPRCompliance,
    DataProcessingActivity,
    CopyrightProtection,
    CopyrightViolation,
    DisputeResolution,
    LegalComplianceAudit,
    WhiteLabelConfig,
    ComplianceReport,
    LegalNotification,
    CreateLicenseRequest,
    GenerateDocumentRequest,
    GDPRConsentRequest,
    ReportViolationRequest,
    CreateDisputeRequest,
    WhiteLabelSetupRequest,
} from '@/types/legal';

export class LegalService {
    private supabase = createClient();

    // License Management
    async getLicenseTypes(): Promise<LicenseType[]> {
        const { data, error } = await this.supabase
            .from('license_types')
            .select('*')
            .eq('is_active', true)
            .order('price_modifier', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async getProductLicenses(productId: string): Promise<ProductLicense[]> {
        const { data, error } = await this.supabase
            .from('product_licenses')
            .select(`
        *,
        license_type:license_types(*)
      `)
            .eq('product_id', productId);

        if (error) throw error;
        return data || [];
    }

    async createProductLicense(request: CreateLicenseRequest): Promise<ProductLicense> {
        // Get license type to calculate price
        const { data: licenseType } = await this.supabase
            .from('license_types')
            .select('*')
            .eq('id', request.license_type_id)
            .single();

        if (!licenseType) {
            throw new Error('License type not found');
        }

        // Get product base price
        const { data: product } = await this.supabase
            .from('products')
            .select('pricing')
            .eq('id', request.product_id)
            .single();

        if (!product) {
            throw new Error('Product not found');
        }

        const basePrice = product.pricing?.amount || 0;
        const calculatedPrice = request.price || (basePrice * licenseType.price_modifier);

        const { data, error } = await this.supabase
            .from('product_licenses')
            .insert({
                ...request,
                price: calculatedPrice,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateProductLicense(id: string, updates: Partial<ProductLicense>): Promise<ProductLicense> {
        const { data, error } = await this.supabase
            .from('product_licenses')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Legal Document Management
    async getLegalDocumentTemplates(
        documentType?: string,
        jurisdiction?: string
    ): Promise<LegalDocumentTemplate[]> {
        let query = this.supabase
            .from('legal_document_templates')
            .select('*');

        if (documentType) {
            query = query.eq('document_type', documentType);
        }

        if (jurisdiction) {
            query = query.eq('jurisdiction', jurisdiction);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async generateLegalDocument(request: GenerateDocumentRequest): Promise<LegalDocument> {
        // Get template
        const { data: template } = await this.supabase
            .from('legal_document_templates')
            .select('*')
            .eq('id', request.template_id)
            .single();

        if (!template) {
            throw new Error('Template not found');
        }

        // Replace variables in content
        let content = template.content;
        for (const [key, value] of Object.entries(request.variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(regex, String(value));
        }

        // Create document
        const { data, error } = await this.supabase
            .from('legal_documents')
            .insert({
                user_id: (await this.supabase.auth.getUser()).data.user?.id!,
                product_id: request.product_id,
                document_type: template.document_type,
                title: template.name,
                content,
                template_id: template.id,
                variables: request.variables,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getUserLegalDocuments(userId: string): Promise<LegalDocument[]> {
        const { data, error } = await this.supabase
            .from('legal_documents')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // GDPR Compliance
    async recordGDPRConsent(request: GDPRConsentRequest): Promise<GDPRCompliance> {
        const userId = (await this.supabase.auth.getUser()).data.user?.id!;

        const { data, error } = await this.supabase
            .from('gdpr_compliance')
            .upsert({
                user_id: userId,
                ...request,
                consent_date: request.consent_given ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getGDPRCompliance(userId: string): Promise<GDPRCompliance | null> {
        const { data, error } = await this.supabase
            .from('gdpr_compliance')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async recordDataProcessingActivity(activity: Omit<DataProcessingActivity, 'id' | 'user_id' | 'created_at'>): Promise<DataProcessingActivity> {
        const userId = (await this.supabase.auth.getUser()).data.user?.id!;

        const { data, error } = await this.supabase
            .from('data_processing_activities')
            .insert({
                user_id: userId,
                ...activity,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async exportUserData(userId: string): Promise<Record<string, any>> {
        // Collect all user data for GDPR export
        const [
            userData,
            productsData,
            ordersData,
            gdprData,
            processingActivities,
        ] = await Promise.all([
            this.supabase.from('users').select('*').eq('id', userId).single(),
            this.supabase.from('products').select('*').eq('user_id', userId),
            this.supabase.from('sales_transactions').select('*').eq('buyer_id', userId),
            this.supabase.from('gdpr_compliance').select('*').eq('user_id', userId),
            this.supabase.from('data_processing_activities').select('*').eq('user_id', userId),
        ]);

        return {
            user_profile: userData.data,
            products: productsData.data || [],
            orders: ordersData.data || [],
            gdpr_compliance: gdprData.data,
            data_processing_activities: processingActivities.data || [],
            export_date: new Date().toISOString(),
        };
    }

    async deleteUserData(userId: string): Promise<void> {
        // Implement GDPR right to erasure
        // Note: This should be carefully implemented to maintain referential integrity
        const { error } = await this.supabase.rpc('delete_user_data', {
            user_id: userId,
        });

        if (error) throw error;
    }

    // Copyright Protection
    async createCopyrightProtection(
        request: Omit<CopyrightProtection, 'id' | 'owner_id' | 'created_at' | 'updated_at'>
    ): Promise<CopyrightProtection> {
        const userId = (await this.supabase.auth.getUser()).data.user?.id!;

        const { data, error } = await this.supabase
            .from('copyright_protections')
            .insert({
                owner_id: userId,
                ...request,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getCopyrightProtections(userId: string): Promise<CopyrightProtection[]> {
        const { data, error } = await this.supabase
            .from('copyright_protections')
            .select('*')
            .eq('owner_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async reportCopyrightViolation(request: ReportViolationRequest): Promise<CopyrightViolation> {
        const userId = (await this.supabase.auth.getUser()).data.user?.id!;

        const { data, error } = await this.supabase
            .from('copyright_violations')
            .insert({
                reported_by: userId,
                ...request,
            })
            .select()
            .single();

        if (error) throw error;

        // Send notification to copyright owner
        await this.sendViolationNotification(data);

        return data;
    }

    async getCopyrightViolations(copyrightId?: string): Promise<CopyrightViolation[]> {
        let query = this.supabase
            .from('copyright_violations')
            .select('*');

        if (copyrightId) {
            query = query.eq('copyright_id', copyrightId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // Dispute Resolution
    async createDispute(request: CreateDisputeRequest): Promise<DisputeResolution> {
        const userId = (await this.supabase.auth.getUser()).data.user?.id!;

        // Generate case number
        const caseNumber = `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const { data, error } = await this.supabase
            .from('dispute_resolutions')
            .insert({
                case_number: caseNumber,
                complainant_id: userId,
                ...request,
            })
            .select()
            .single();

        if (error) throw error;

        // Send notification to respondent
        await this.sendDisputeNotification(data);

        return data;
    }

    async getDisputes(userId: string): Promise<DisputeResolution[]> {
        const { data, error } = await this.supabase
            .from('dispute_resolutions')
            .select('*')
            .or(`complainant_id.eq.${userId},respondent_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async updateDisputeStatus(
        disputeId: string,
        status: string,
        resolution?: string
    ): Promise<DisputeResolution> {
        const updates: any = { status };

        if (resolution) {
            updates.resolution = resolution;
            updates.resolution_date = new Date().toISOString();
        }

        const { data, error } = await this.supabase
            .from('dispute_resolutions')
            .update(updates)
            .eq('id', disputeId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // White Labeling
    async createWhiteLabelConfig(request: WhiteLabelSetupRequest): Promise<WhiteLabelConfig> {
        const userId = (await this.supabase.auth.getUser()).data.user?.id!;

        const { data, error } = await this.supabase
            .from('white_label_configs')
            .insert({
                client_id: userId,
                ...request,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getWhiteLabelConfig(userId: string): Promise<WhiteLabelConfig | null> {
        const { data, error } = await this.supabase
            .from('white_label_configs')
            .select('*')
            .eq('client_id', userId)
            .eq('is_active', true)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async updateWhiteLabelConfig(
        configId: string,
        updates: Partial<WhiteLabelConfig>
    ): Promise<WhiteLabelConfig> {
        const { data, error } = await this.supabase
            .from('white_label_configs')
            .update(updates)
            .eq('id', configId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Legal Compliance Audits
    async createComplianceAudit(auditType: string, userId?: string): Promise<LegalComplianceAudit> {
        const currentUserId = userId || (await this.supabase.auth.getUser()).data.user?.id!;

        const { data, error } = await this.supabase
            .from('legal_compliance_audits')
            .insert({
                user_id: currentUserId,
                audit_type: auditType,
                status: 'pending',
            })
            .select()
            .single();

        if (error) throw error;

        // Start audit process
        await this.processComplianceAudit(data.id);

        return data;
    }

    async processComplianceAudit(auditId: string): Promise<void> {
        // Update status to in_progress
        await this.supabase
            .from('legal_compliance_audits')
            .update({ status: 'in_progress' })
            .eq('id', auditId);

        // Get audit details
        const { data: audit } = await this.supabase
            .from('legal_compliance_audits')
            .select('*')
            .eq('id', auditId)
            .single();

        if (!audit) return;

        let complianceReport: ComplianceReport;

        switch (audit.audit_type) {
            case 'gdpr':
                complianceReport = await this.auditGDPRCompliance(audit.user_id);
                break;
            case 'copyright':
                complianceReport = await this.auditCopyrightCompliance(audit.user_id);
                break;
            case 'licensing':
                complianceReport = await this.auditLicensingCompliance(audit.user_id);
                break;
            default:
                complianceReport = await this.auditGeneralCompliance(audit.user_id);
        }

        // Update audit with results
        await this.supabase
            .from('legal_compliance_audits')
            .update({
                compliance_score: complianceReport.overall_score,
                findings: complianceReport,
                recommendations: complianceReport.recommendations,
                action_items: complianceReport.action_items,
                status: 'completed',
                next_audit_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
            })
            .eq('id', auditId);
    }

    private async auditGDPRCompliance(userId: string): Promise<ComplianceReport> {
        const gdprCompliance = await this.getGDPRCompliance(userId);
        const legalDocs = await this.getUserLegalDocuments(userId);

        const hasPrivacyPolicy = legalDocs.some(doc => doc.document_type === 'privacy_policy');
        const hasValidConsent = gdprCompliance?.consent_given || false;

        const score = (hasPrivacyPolicy ? 50 : 0) + (hasValidConsent ? 50 : 0);

        return {
            overall_score: score,
            gdpr_compliance: hasValidConsent && hasPrivacyPolicy,
            copyright_protection: true, // Not relevant for GDPR audit
            licensing_clarity: true, // Not relevant for GDPR audit
            legal_documents_current: hasPrivacyPolicy,
            recommendations: score < 100 ? [
                !hasPrivacyPolicy && 'Create a GDPR-compliant privacy policy',
                !hasValidConsent && 'Obtain proper user consent for data processing',
            ].filter(Boolean) : [],
            action_items: score < 100 ? [
                'Review and update privacy policy',
                'Implement consent management system',
            ] : [],
        };
    }

    private async auditCopyrightCompliance(userId: string): Promise<ComplianceReport> {
        const copyrights = await this.getCopyrightProtections(userId);
        const { data: products } = await this.supabase
            .from('products')
            .select('id')
            .eq('user_id', userId);

        const productCount = products?.length || 0;
        const protectedCount = copyrights.length;

        const score = productCount > 0 ? Math.min(100, (protectedCount / productCount) * 100) : 100;

        return {
            overall_score: score,
            gdpr_compliance: true, // Not relevant for copyright audit
            copyright_protection: score >= 80,
            licensing_clarity: true, // Will be checked separately
            legal_documents_current: true,
            recommendations: score < 80 ? [
                'Add copyright protection to unprotected products',
                'Consider registering copyrights for valuable content',
            ] : [],
            action_items: score < 80 ? [
                'Review product portfolio for copyright gaps',
                'Implement automated copyright notices',
            ] : [],
        };
    }

    private async auditLicensingCompliance(userId: string): Promise<ComplianceReport> {
        const { data: products } = await this.supabase
            .from('products')
            .select(`
        id,
        product_licenses(*)
      `)
            .eq('user_id', userId);

        const productCount = products?.length || 0;
        const licensedCount = products?.filter(p => p.product_licenses.length > 0).length || 0;

        const score = productCount > 0 ? (licensedCount / productCount) * 100 : 100;

        return {
            overall_score: score,
            gdpr_compliance: true, // Not relevant
            copyright_protection: true, // Not relevant
            licensing_clarity: score >= 90,
            legal_documents_current: true,
            recommendations: score < 90 ? [
                'Add clear licensing terms to all products',
                'Consider offering multiple license options',
            ] : [],
            action_items: score < 90 ? [
                'Review products without licenses',
                'Create standard license templates',
            ] : [],
        };
    }

    private async auditGeneralCompliance(userId: string): Promise<ComplianceReport> {
        const [gdprReport, copyrightReport, licensingReport] = await Promise.all([
            this.auditGDPRCompliance(userId),
            this.auditCopyrightCompliance(userId),
            this.auditLicensingCompliance(userId),
        ]);

        const overallScore = Math.round(
            (gdprReport.overall_score + copyrightReport.overall_score + licensingReport.overall_score) / 3
        );

        return {
            overall_score: overallScore,
            gdpr_compliance: gdprReport.gdpr_compliance,
            copyright_protection: copyrightReport.copyright_protection,
            licensing_clarity: licensingReport.licensing_clarity,
            legal_documents_current: true,
            recommendations: [
                ...gdprReport.recommendations,
                ...copyrightReport.recommendations,
                ...licensingReport.recommendations,
            ],
            action_items: [
                ...gdprReport.action_items,
                ...copyrightReport.action_items,
                ...licensingReport.action_items,
            ],
        };
    }

    // Notification helpers
    private async sendViolationNotification(violation: CopyrightViolation): Promise<void> {
        // Implementation would send email/in-app notification
        console.log('Sending violation notification:', violation.id);
    }

    private async sendDisputeNotification(dispute: DisputeResolution): Promise<void> {
        // Implementation would send email/in-app notification
        console.log('Sending dispute notification:', dispute.case_number);
    }

    // Legal notifications
    async getLegalNotifications(userId: string): Promise<LegalNotification[]> {
        // This would typically aggregate from various sources
        const [violations, disputes, audits] = await Promise.all([
            this.getCopyrightViolations(),
            this.getDisputes(userId),
            this.supabase
                .from('legal_compliance_audits')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'completed')
                .lt('compliance_score', 80),
        ]);

        const notifications: LegalNotification[] = [];

        // Add violation notifications
        violations.forEach(violation => {
            if (violation.status === 'pending') {
                notifications.push({
                    id: `violation-${violation.id}`,
                    type: 'violation',
                    title: 'Copyright Violation Reported',
                    message: `A copyright violation has been reported for your content.`,
                    severity: 'high',
                    action_required: true,
                    created_at: violation.created_at,
                });
            }
        });

        // Add dispute notifications
        disputes.forEach(dispute => {
            if (dispute.status === 'open') {
                notifications.push({
                    id: `dispute-${dispute.id}`,
                    type: 'dispute',
                    title: 'New Dispute Case',
                    message: `Dispute case ${dispute.case_number} requires your attention.`,
                    severity: 'medium',
                    action_required: true,
                    created_at: dispute.created_at,
                });
            }
        });

        // Add compliance notifications
        if (audits.data) {
            audits.data.forEach(audit => {
                notifications.push({
                    id: `audit-${audit.id}`,
                    type: 'compliance',
                    title: 'Compliance Issue Detected',
                    message: `Your ${audit.audit_type} compliance score is below recommended levels.`,
                    severity: audit.compliance_score < 50 ? 'critical' : 'medium',
                    action_required: true,
                    created_at: audit.audit_date,
                });
            });
        }

        return notifications.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
}