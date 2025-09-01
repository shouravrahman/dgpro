import { NextRequest, NextResponse } from 'next/server';
import { LegalService } from '@/lib/services/legal';
import { createClient } from '@/lib/supabase/server';
import { createDisputeSchema } from '@/lib/validations/legal';

const legalService = new LegalService();

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const disputes = await legalService.getDisputes(user.id);
        return NextResponse.json({ data: disputes });
    } catch (error) {
        console.error('Get disputes error:', error);
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
        const validatedData = createDisputeSchema.parse(body);

        const dispute = await legalService.createDispute(validatedData);
        return NextResponse.json({ data: dispute }, { status: 201 });
    } catch (error) {
        console.error('Create dispute error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}