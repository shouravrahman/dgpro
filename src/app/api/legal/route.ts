import { NextRequest, NextResponse } from 'next/server';
import { LegalService } from '@/lib/services/legal';
import { createClient } from '@/lib/supabase/server';

const legalService = new LegalService();

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        switch (type) {
            case 'license-types':
                const licenseTypes = await legalService.getLicenseTypes();
                return NextResponse.json({ data: licenseTypes });

            case 'document-templates':
                const documentType = searchParams.get('document_type');
                const jurisdiction = searchParams.get('jurisdiction');
                const templates = await legalService.getLegalDocumentTemplates(
                    documentType || undefined,
                    jurisdiction || undefined
                );
                return NextResponse.json({ data: templates });

            case 'user-documents':
                const documents = await legalService.getUserLegalDocuments(user.id);
                return NextResponse.json({ data: documents });

            case 'gdpr-compliance':
                const gdprCompliance = await legalService.getGDPRCompliance(user.id);
                return NextResponse.json({ data: gdprCompliance });

            case 'copyright-protections':
                const copyrights = await legalService.getCopyrightProtections(user.id);
                return NextResponse.json({ data: copyrights });

            case 'disputes':
                const disputes = await legalService.getDisputes(user.id);
                return NextResponse.json({ data: disputes });

            case 'white-label-config':
                const whiteLabelConfig = await legalService.getWhiteLabelConfig(user.id);
                return NextResponse.json({ data: whiteLabelConfig });

            case 'notifications':
                const notifications = await legalService.getLegalNotifications(user.id);
                return NextResponse.json({ data: notifications });

            default:
                return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
        }
    } catch (error) {
        console.error('Legal API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}