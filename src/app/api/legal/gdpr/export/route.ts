import { NextRequest, NextResponse } from 'next/server';
import { LegalService } from '@/lib/services/legal';
import { createClient } from '@/lib/supabase/server';

const legalService = new LegalService();

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userData = await legalService.exportUserData(user.id);

        // Create a downloadable JSON file
        const jsonData = JSON.stringify(userData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });

        return new NextResponse(blob, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="user-data-export-${user.id}-${new Date().toISOString().split('T')[0]}.json"`,
            },
        });
    } catch (error) {
        console.error('Export user data error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}