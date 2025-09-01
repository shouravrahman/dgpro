import { NextRequest, NextResponse } from 'next/server';
import { LegalService } from '@/lib/services/legal';
import { createClient } from '@/lib/supabase/server';
import { generateDocumentSchema } from '@/lib/validations/legal';

const legalService = new LegalService();

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = generateDocumentSchema.parse(body);

        // If product_id is provided, verify user owns the product
        if (validatedData.product_id) {
            const { data: product } = await supabase
                .from('products')
                .select('user_id')
                .eq('id', validatedData.product_id)
                .single();

            if (!product || product.user_id !== user.id) {
                return NextResponse.json({ error: 'Product not found or access denied' }, { status: 403 });
            }
        }

        const document = await legalService.generateLegalDocument(validatedData);
        return NextResponse.json({ data: document }, { status: 201 });
    } catch (error) {
        console.error('Generate document error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}