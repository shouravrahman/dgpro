import { NextRequest, NextResponse } from 'next/server';
import { LegalService } from '@/lib/services/legal';
import { createClient } from '@/lib/supabase/server';
import { whiteLabelSetupSchema, updateWhiteLabelSchema } from '@/lib/validations/legal';

const legalService = new LegalService();

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const config = await legalService.getWhiteLabelConfig(user.id);
        return NextResponse.json({ data: config });
    } catch (error) {
        console.error('Get white label config error:', error);
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

        // Check if user has enterprise subscription
        const { data: userData } = await supabase
            .from('users')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();

        if (!userData || userData.subscription_tier !== 'enterprise') {
            return NextResponse.json(
                { error: 'White labeling requires enterprise subscription' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validatedData = whiteLabelSetupSchema.parse(body);

        const config = await legalService.createWhiteLabelConfig(validatedData);
        return NextResponse.json({ data: config }, { status: 201 });
    } catch (error) {
        console.error('Create white label config error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = updateWhiteLabelSchema.parse(body);

        // Get existing config
        const existingConfig = await legalService.getWhiteLabelConfig(user.id);
        if (!existingConfig) {
            return NextResponse.json({ error: 'White label config not found' }, { status: 404 });
        }

        const updatedConfig = await legalService.updateWhiteLabelConfig(
            existingConfig.id,
            validatedData
        );
        return NextResponse.json({ data: updatedConfig });
    } catch (error) {
        console.error('Update white label config error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}