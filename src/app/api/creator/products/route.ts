import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { checkUsageLimit, incrementUsage } from '@/lib/usage-limits';
import { z } from 'zod';

const createProductSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    category: z.string().min(1),
    subcategory: z.string().optional(),
    tags: z.array(z.string()).max(10),
    type: z.enum(['pdf', 'image', 'text']),
    pricing: z.object({
        type: z.enum(['free', 'one-time']),
        amount: z.number().min(0).optional(),
        currency: z.string().default('USD'),
        originalPrice: z.number().min(0).optional()
    }),
    metadata: z.object({
        difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
        estimatedTime: z.string().optional(),
        requirements: z.array(z.string()).optional(),
        compatibility: z.array(z.string()).optional()
    }),
    visibility: z.enum(['public', 'private', 'unlisted']),
    publishImmediately: z.boolean(),
    instructions: z.string().optional(),
    preview: z.string().optional(),
    aiGenerated: z.boolean().default(false)
});

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Check usage limits
        const usageCheck = await checkUsageLimit(user.id, 'products');
        if (!usageCheck.canUse) {
            return NextResponse.json(
                {
                    error: 'Product creation limit reached',
                    details: {
                        current: usageCheck.currentUsage,
                        limit: usageCheck.limit,
                        tier: usageCheck.tier
                    }
                },
                { status: 403 }
            );
        }

        const formData = await request.formData();

        // Parse form data
        const productData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string,
            subcategory: formData.get('subcategory') as string || undefined,
            tags: JSON.parse(formData.get('tags') as string || '[]'),
            type: formData.get('type') as string,
            pricing: JSON.parse(formData.get('pricing') as string),
            metadata: JSON.parse(formData.get('metadata') as string),
            visibility: formData.get('visibility') as string,
            publishImmediately: formData.get('publishImmediately') === 'true',
            instructions: formData.get('instructions') as string || undefined,
            preview: formData.get('preview') as string || undefined,
            aiGenerated: formData.get('aiGenerated') === 'true'
        };

        // Validate data
        const validatedData = createProductSchema.parse(productData);

        // Handle file uploads
        const files = formData.getAll('files') as File[];
        const uploadedFiles = [];

        const supabase = createClient();

        const supabase = await createClient();

        // Upload files to storage
        for (const file of files) {
            if (file.size > 0) {
                const fileName = `${user.id}/${Date.now()}-${file.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('product-files')
                    .upload(fileName, file);

                if (uploadError) {
                    console.error('File upload error:', uploadError);
                    continue;
                }

                uploadedFiles.push({
                    name: file.name,
                    path: uploadData.path,
                    size: file.size,
                    type: file.type
                });
            }
        }

        // Create product in database
        const { data: product, error: productError } = await supabase
            .from('products')
            .insert({
                creator_id: user.id,
                title: validatedData.title,
                description: validatedData.description,
                category: validatedData.category,
                subcategory: validatedData.subcategory,
                tags: validatedData.tags,
                type: validatedData.type,
                pricing_type: validatedData.pricing.type,
                price: validatedData.pricing.amount || 0,
                currency: validatedData.pricing.currency,
                original_price: validatedData.pricing.originalPrice,
                difficulty: validatedData.metadata.difficulty,
                estimated_time: validatedData.metadata.estimatedTime,
                requirements: validatedData.metadata.requirements,
                compatibility: validatedData.metadata.compatibility,
                visibility: validatedData.visibility,
                status: validatedData.publishImmediately ? 'published' : 'draft',
                content_instructions: validatedData.instructions,
                content_preview: validatedData.preview,
                ai_generated: validatedData.aiGenerated,
                files: uploadedFiles
            })
            .select()
            .single();

        if (productError) {
            console.error('Product creation error:', productError);
            return NextResponse.json(
                { error: 'Failed to create product' },
                { status: 500 }
            );
        }

        // Increment usage counter
        await incrementUsage(user.id, 'products');

        // If published immediately, update marketplace
        if (validatedData.publishImmediately && validatedData.visibility === 'public') {
            // Add to marketplace (this could be a separate table or just a flag)
            await supabase
                .from('marketplace_listings')
                .insert({
                    product_id: product.id,
                    creator_id: user.id,
                    featured: false,
                    promoted: false
                });
        }

        return NextResponse.json({
            success: true,
            data: product,
            message: validatedData.publishImmediately ? 'Product published successfully!' : 'Product saved as draft'
        });

    } catch (error) {
        console.error('Product creation error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Invalid product data',
                    details: error.errors
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status'); // 'published', 'draft', 'archived'
        const type = searchParams.get('type'); // 'pdf', 'image', 'text'

        const supabase = await createClient();

        let query = supabase
            .from('products')
            .select(`
        *,
        marketplace_listings (
          id,
          featured,
          promoted
        )
      `)
            .eq('creator_id', user.id)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        if (type) {
            query = query.eq('type', type);
        }

        const { data: products, error, count } = await query
            .range((page - 1) * limit, page * limit - 1);

        if (error) {
            console.error('Products fetch error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch products' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit)
            }
        });

    } catch (error) {
        console.error('Products fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}