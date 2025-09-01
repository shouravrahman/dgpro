import { NextRequest, NextResponse } from 'next/server';
import { LegalService } from '@/lib/services/legal';
import { createClient } from '@/lib/supabase/server';
import { reportViolationSchema } from '@/lib/validations/legal';

const legalService = new LegalService();

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const copyrightId = searchParams.get('copyright_id');

        const violations = await legalService.getCopyrightViolations(
            copyrightId || undefined
        );
        return NextResponse.json({ data: violations });
    } catch (error) {
        console.error('Get copyright violations error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = reportViolationSchema.parse(body);

        const violation = await legalService.reportCopyrightViolation(validatedData);
        return NextResponse.json({ data: violation }, { status: 201 });
    } catch (error) {
        console.error('Report copyright violation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}