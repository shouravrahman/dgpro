import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MarketingService } from '@/lib/services/marketing';

export async function GET(request: NextRequest) {
    try {
        const marketingService = new MarketingService();
        const templates = await marketingService.getEmailTemplates();

        return NextResponse.json({
            success: true,
            data: templates,
        });
    } catch (error) {
        console.error('Error fetching email templates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch email templates' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const marketingService = new MarketingService();
        const template = await marketingService.createEmailTemplate(user.id, body);

        return NextResponse.json({
            success: true,
            data: template,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating email template:', error);
        return NextResponse.json(
            { error: 'Failed to create email template' },
            { status: 500 }
        );
    }
}