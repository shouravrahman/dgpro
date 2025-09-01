import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
    LicenseType,
    ProductLicense,
    LegalDocument,
    LegalDocumentTemplate,
    GDPRCompliance,
    CopyrightProtection,
    CopyrightViolation,
    DisputeResolution,
    WhiteLabelConfig,
    LegalNotification,
    CreateLicenseRequest,
    GenerateDocumentRequest,
    GDPRConsentRequest,
    ReportViolationRequest,
    CreateDisputeRequest,
    WhiteLabelSetupRequest,
} from '@/types/legal';

// License Management
export function useLicenseTypes() {
    return useQuery({
        queryKey: ['license-types'],
        queryFn: async (): Promise<LicenseType[]> => {
            const response = await fetch('/api/legal?type=license-types');
            if (!response.ok) throw new Error('Failed to fetch license types');
            const data = await response.json();
            return data.data;
        },
    });
}

export function useProductLicenses(productId: string) {
    return useQuery({
        queryKey: ['product-licenses', productId],
        queryFn: async (): Promise<ProductLicense[]> => {
            const response = await fetch(`/api/legal/licenses?product_id=${productId}`);
            if (!response.ok) throw new Error('Failed to fetch product licenses');
            const data = await response.json();
            return data.data;
        },
        enabled: !!productId,
    });
}

export function useCreateProductLicense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: CreateLicenseRequest): Promise<ProductLicense> => {
            const response = await fetch('/api/legal/licenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            if (!response.ok) throw new Error('Failed to create license');
            const data = await response.json();
            return data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['product-licenses', variables.product_id] });
        },
    });
}

// Legal Document Management
export function useLegalDocumentTemplates(documentType?: string, jurisdiction?: string) {
    return useQuery({
        queryKey: ['legal-document-templates', documentType, jurisdiction],
        queryFn: async (): Promise<LegalDocumentTemplate[]> => {
            const params = new URLSearchParams({ type: 'document-templates' });
            if (documentType) params.append('document_type', documentType);
            if (jurisdiction) params.append('jurisdiction', jurisdiction);

            const response = await fetch(`/api/legal?${params}`);
            if (!response.ok) throw new Error('Failed to fetch document templates');
            const data = await response.json();
            return data.data;
        },
    });
}

export function useUserLegalDocuments() {
    return useQuery({
        queryKey: ['user-legal-documents'],
        queryFn: async (): Promise<LegalDocument[]> => {
            const response = await fetch('/api/legal?type=user-documents');
            if (!response.ok) throw new Error('Failed to fetch user documents');
            const data = await response.json();
            return data.data;
        },
    });
}

export function useGenerateLegalDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: GenerateDocumentRequest): Promise<LegalDocument> => {
            const response = await fetch('/api/legal/documents/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            if (!response.ok) throw new Error('Failed to generate document');
            const data = await response.json();
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-legal-documents'] });
        },
    });
}

// GDPR Compliance
export function useGDPRCompliance() {
    return useQuery({
        queryKey: ['gdpr-compliance'],
        queryFn: async (): Promise<GDPRCompliance | null> => {
            const response = await fetch('/api/legal/gdpr/consent');
            if (!response.ok) throw new Error('Failed to fetch GDPR compliance');
            const data = await response.json();
            return data.data;
        },
    });
}

export function useRecordGDPRConsent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: GDPRConsentRequest): Promise<GDPRCompliance> => {
            const response = await fetch('/api/legal/gdpr/consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            if (!response.ok) throw new Error('Failed to record GDPR consent');
            const data = await response.json();
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gdpr-compliance'] });
        },
    });
}

export function useExportUserData() {
    return useMutation({
        mutationFn: async (): Promise<Blob> => {
            const response = await fetch('/api/legal/gdpr/export', {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to export user data');
            return response.blob();
        },
    });
}

// Copyright Protection
export function useCopyrightProtections() {
    return useQuery({
        queryKey: ['copyright-protections'],
        queryFn: async (): Promise<CopyrightProtection[]> => {
            const response = await fetch('/api/legal/copyright');
            if (!response.ok) throw new Error('Failed to fetch copyright protections');
            const data = await response.json();
            return data.data;
        },
    });
}

export function useCreateCopyrightProtection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: Omit<CopyrightProtection, 'id' | 'owner_id' | 'created_at' | 'updated_at'>): Promise<CopyrightProtection> => {
            const response = await fetch('/api/legal/copyright', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            if (!response.ok) throw new Error('Failed to create copyright protection');
            const data = await response.json();
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['copyright-protections'] });
        },
    });
}

export function useCopyrightViolations(copyrightId?: string) {
    return useQuery({
        queryKey: ['copyright-violations', copyrightId],
        queryFn: async (): Promise<CopyrightViolation[]> => {
            const params = copyrightId ? `?copyright_id=${copyrightId}` : '';
            const response = await fetch(`/api/legal/copyright/violations${params}`);
            if (!response.ok) throw new Error('Failed to fetch copyright violations');
            const data = await response.json();
            return data.data;
        },
    });
}

export function useReportCopyrightViolation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: ReportViolationRequest): Promise<CopyrightViolation> => {
            const response = await fetch('/api/legal/copyright/violations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            if (!response.ok) throw new Error('Failed to report copyright violation');
            const data = await response.json();
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['copyright-violations'] });
        },
    });
}

// Dispute Resolution
export function useDisputes() {
    return useQuery({
        queryKey: ['disputes'],
        queryFn: async (): Promise<DisputeResolution[]> => {
            const response = await fetch('/api/legal/disputes');
            if (!response.ok) throw new Error('Failed to fetch disputes');
            const data = await response.json();
            return data.data;
        },
    });
}

export function useCreateDispute() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: CreateDisputeRequest): Promise<DisputeResolution> => {
            const response = await fetch('/api/legal/disputes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            if (!response.ok) throw new Error('Failed to create dispute');
            const data = await response.json();
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disputes'] });
        },
    });
}

// White Labeling
export function useWhiteLabelConfig() {
    return useQuery({
        queryKey: ['white-label-config'],
        queryFn: async (): Promise<WhiteLabelConfig | null> => {
            const response = await fetch('/api/legal/white-label');
            if (!response.ok) throw new Error('Failed to fetch white label config');
            const data = await response.json();
            return data.data;
        },
    });
}

export function useCreateWhiteLabelConfig() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: WhiteLabelSetupRequest): Promise<WhiteLabelConfig> => {
            const response = await fetch('/api/legal/white-label', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            if (!response.ok) throw new Error('Failed to create white label config');
            const data = await response.json();
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['white-label-config'] });
        },
    });
}

export function useUpdateWhiteLabelConfig() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updates: Partial<WhiteLabelConfig>): Promise<WhiteLabelConfig> => {
            const response = await fetch('/api/legal/white-label', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error('Failed to update white label config');
            const data = await response.json();
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['white-label-config'] });
        },
    });
}

// Compliance Audits
export function useCreateComplianceAudit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (auditType: string): Promise<any> => {
            const response = await fetch('/api/legal/compliance/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audit_type: auditType }),
            });
            if (!response.ok) throw new Error('Failed to create compliance audit');
            const data = await response.json();
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['compliance-audits'] });
        },
    });
}

export function useComplianceAudits() {
    return useQuery({
        queryKey: ['compliance-audits'],
        queryFn: async (): Promise<any[]> => {
            const response = await fetch('/api/legal/compliance/audit');
            if (!response.ok) throw new Error('Failed to fetch compliance audits');
            const data = await response.json();
            return data.data;
        },
    });
}

// Legal Notifications
export function useLegalNotifications() {
    return useQuery({
        queryKey: ['legal-notifications'],
        queryFn: async (): Promise<LegalNotification[]> => {
            const response = await fetch('/api/legal?type=notifications');
            if (!response.ok) throw new Error('Failed to fetch legal notifications');
            const data = await response.json();
            return data.data;
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    });
}

// Custom hook for legal dashboard
export function useLegalDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    const licenseTypes = useLicenseTypes();
    const gdprCompliance = useGDPRCompliance();
    const copyrightProtections = useCopyrightProtections();
    const disputes = useDisputes();
    const whiteLabelConfig = useWhiteLabelConfig();
    const notifications = useLegalNotifications();
    const complianceAudits = useComplianceAudits();

    const isLoading =
        licenseTypes.isLoading ||
        gdprCompliance.isLoading ||
        copyrightProtections.isLoading ||
        disputes.isLoading ||
        whiteLabelConfig.isLoading ||
        notifications.isLoading ||
        complianceAudits.isLoading;

    return {
        activeTab,
        setActiveTab,
        data: {
            licenseTypes: licenseTypes.data || [],
            gdprCompliance: gdprCompliance.data,
            copyrightProtections: copyrightProtections.data || [],
            disputes: disputes.data || [],
            whiteLabelConfig: whiteLabelConfig.data,
            notifications: notifications.data || [],
            complianceAudits: complianceAudits.data || [],
        },
        isLoading,
        refetch: () => {
            licenseTypes.refetch();
            gdprCompliance.refetch();
            copyrightProtections.refetch();
            disputes.refetch();
            whiteLabelConfig.refetch();
            notifications.refetch();
            complianceAudits.refetch();
        },
    };
}