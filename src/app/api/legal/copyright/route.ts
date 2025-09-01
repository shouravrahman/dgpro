import { NextRequest, NextResponse } from 'next/server';
import { LegalService } from '@/lib/services/legal';
import { createClient } from '@/lib/supabase/server';
import { createCopyrightProtectionSchema } from '@/lib/validations/legal';

const legalService = new LegalService();

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const copyrights = await legalService.getCopyrightProtections(user.id);
        return NextResponse.json({ data: copyrights });
    } catch (error) {
        console.error('Get copyright protections error:', error);
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
        const validatedData = createCopyrightProtectionSchema.parse(body);

        // Verify user owns the product
        const { data: product } = await supabase
            .from('products')
            .select('user_id')
            .eq('id', validatedData.product_id)
            .single();

        if (!product || product.user_id !== user.id) {
            return NextResponse.json({ error: 'Product not found or access denied' }, { status: 403 });
        }

        const copyright = await legalService.createCopyrightProtection(validatedData);
        return NextResponse.json({ data: copyright }, { status: 201 });
    } catch (error) {
        console.error('Create copyright protection error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}