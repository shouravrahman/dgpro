import { NextRequest, NextResponse } from 'next/server';
import { LegalService } from '@/lib/services/legal';
import { createClient } from '@/lib/supabase/server';
import { createAuditSchema } from '@/lib/validations/legal';

const legalService = new LegalService();

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = createAuditSchema.parse(body);

        const audit = await legalService.createComplianceAudit(
            validatedData.audit_type,
            validatedData.user_id || user.id
        );

        return NextResponse.json({ data: audit }, { status: 201 });
    } catch (error) {
        console.error('Create compliance audit error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: audits, error } = await supabase
            .from('legal_compliance_audits')
            .select('*')
            .eq('user_id', user.id)
            .order('audit_date', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ data: audits || [] });
    } catch (error) {
        console.error('Get compliance audits error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}