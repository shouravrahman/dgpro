import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MarketingService } from '@/lib/services/marketing';
import { marketingValidations } from '@/lib/validations/marketing';
import { z } from 'zod';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, {
                status: 401
            });
        }

        const marketingService = new MarketingService();
        const campaign = await marketingService.getEmailCampaign(user.id, params.id);

        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: campaign,
        });
    } catch (error) {
        console.error('Error fetching email campaign:', error);
        return NextResponse.json(
            { error: 'Failed to fetch email campaign' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validate request body
        const validatedData = marketingValidations.updateEmailCampaign.parse(body);

        const marketingService = new MarketingService();
        const campaign = await marketingService.updateEmailCampaign(user.id, params.id, validatedData);

        return NextResponse.json({
            success: true,
            data: campaign,
        });
    } catch (error) {
        console.error('Error updating email campaign:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update email campaign' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const marketingService = new MarketingService();
        await marketingService.deleteEmailCampaign(user.id, params.id);

        return NextResponse.json({
            success: true,
            message: 'Campaign deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting email campaign:', error);
        return NextResponse.json(
            { error: 'Failed to delete email campaign' },
            { status: 500 }
        );
    }
}