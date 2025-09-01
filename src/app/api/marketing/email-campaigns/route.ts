import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MarketingService } from '@/lib/services/marketing';
import { marketingValidations } from '@/lib/validations/marketing';
import { z } from 'zod';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const filters = {
            status: searchParams.get('status') || undefined,
            search: searchParams.get('search') || undefined,
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '20'),
        };

        const marketingService = new MarketingService();
        const campaigns = await marketingService.getEmailCampaigns(user.id, filters);

        return NextResponse.json({
            success: true,
            data: campaigns,
        });
    } catch (error) {
        console.error('Error fetching email campaigns:', error);
        return NextResponse.json(
            { error: 'Failed to fetch email campaigns' },
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

        // Validate request body
        const validatedData = marketingValidations.createEmailCampaign.parse(body);

        const marketingService = new MarketingService();
        const campaign = await marketingService.createEmailCampaign(user.id, validatedData);

        return NextResponse.json({
            success: true,
            data: campaign,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating email campaign:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create email campaign' },
            { status: 500 }
        );
    }
}