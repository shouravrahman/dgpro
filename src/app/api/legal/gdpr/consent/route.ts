import { NextRequest, NextResponse } from 'next/server';
import { LegalService } from '@/lib/services/legal';
import { createClient } from '@/lib/supabase/server';
import { gdprConsentSchema } from '@/lib/validations/legal';

const legalService = new LegalService();

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = gdprConsentSchema.parse(body);

        const compliance = await legalService.recordGDPRConsent(validatedData);
        return NextResponse.json({ data: compliance }, { status: 201 });
    } catch (error) {
        console.error('GDPR consent error:', error);
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

        const compliance = await legalService.getGDPRCompliance(user.id);
        return NextResponse.json({ data: compliance });
    } catch (error) {
        console.error('Get GDPR compliance error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}