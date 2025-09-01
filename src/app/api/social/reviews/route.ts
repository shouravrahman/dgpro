import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createReviewSchema = z.object({
    product_id: z.string().uuid(),
    rating: z.number().min(1).max(5),
    title: z.string().min(1).max(200).optional(),
    content: z.string().max(2000).optional(),
});

const voteSchema = z.object({
    review_id: z.string().uuid(),
    is_helpful: z.boolean(),
});

export async function GET(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('product_id');
        const userId = searchParams.get('user_id');
        const rating = searchParams.get('rating');
        const sort = searchParams.get('sort') || 'newest';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const offset = (page - 1) * limit;

        let query = supabase
            .from('product_reviews')
            .select(`
        *,
        reviewer:user_profiles!reviewer_id (
          user_id,
          display_name,
          avatar_url,
          is_verified,
          reputation_score
        ),
        product:products (
          id,
          name
        )
      `)
            .range(offset, offset + limit - 1);

        // Apply filters
        if (productId) {
            query = query.eq('product_id', productId);
        }
        if (userId) {
            query = query.eq('reviewer_id', userId);
        }
        if (rating) {
            query = query.eq('rating', parseInt(rating));
        }

        // Apply sorting
        switch (sort) {
            case 'oldest':
                query = query.order('created_at', { ascending: true });
                break;
            case 'helpful':
                query = query.order('helpful_count', { ascending: false });
                break;
            case 'newest':
            default:
                query = query.order('created_at', { ascending: false });
                break;
        }

        const { data: reviews, error, count } = await query;

        if (error) {
            console.error('Error fetching reviews:', error);
            return NextResponse.json(
                { error: 'Failed to fetch reviews' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            reviews,
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error) {
        console.error('Reviews API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = createReviewSchema.parse(body);

        // Check if user already reviewed this product
        const { data: existingReview } = await supabase
            .from('product_reviews')
            .select('id')
            .eq('product_id', validatedData.product_id)
            .eq('reviewer_id', session.user.id)
            .single();

        if (existingReview) {
            return NextResponse.json(
                { error: 'You have already reviewed this product' },
                { status: 400 }
            );
        }

        // Check if product exists
        const { data: product } = await supabase
            .from('products')
            .select('id, user_id')
            .eq('id', validatedData.product_id)
            .single();

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Can't review your own product
        if (product.user_id === session.user.id) {
            return NextResponse.json(
                { error: 'Cannot review your own product' },
                { status: 400 }
            );
        }

        const { data: review, error } = await supabase
            .from('product_reviews')
            .insert({
                ...validatedData,
                reviewer_id: session.user.id,
            })
            .select(`
        *,
        reviewer:user_profiles!reviewer_id (
          user_id,
          display_name,
          avatar_url,
          is_verified,
          reputation_score
        )
      `)
            .single();

        if (error) {
            console.error('Error creating review:', error);
            return NextResponse.json(
                { error: 'Failed to create review' },
                { status: 500 }
            );
        }

        // Create notification for product owner
        await supabase
            .from('notifications')
            .insert({
                user_id: product.user_id,
                type: 'review',
                title: 'New Product Review',
                message: `Your product received a ${validatedData.rating}-star review`,
                action_url: `/products/${validatedData.product_id}#reviews`,
                metadata: {
                    review_id: review.id,
                    rating: validatedData.rating,
                    reviewer_id: session.user.id
                },
            });

        return NextResponse.json({ review });
    } catch (error) {
        console.error('Review creation error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid data', details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to create review' },
            { status: 500 }
        );
    }
}

// Vote on review helpfulness
export async function PUT(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { review_id, is_helpful } = voteSchema.parse(body);

        // Check if user already voted on this review
        const { data: existingVote } = await supabase
            .from('review_votes')
            .select('id, is_helpful')
            .eq('review_id', review_id)
            .eq('user_id', session.user.id)
            .single();

        if (existingVote) {
            // Update existing vote
            const { error } = await supabase
                .from('review_votes')
                .update({ is_helpful })
                .eq('id', existingVote.id);

            if (error) {
                console.error('Error updating vote:', error);
                return NextResponse.json(
                    { error: 'Failed to update vote' },
                    { status: 500 }
                );
            }
        } else {
            // Create new vote
            const { error } = await supabase
                .from('review_votes')
                .insert({
                    review_id,
                    user_id: session.user.id,
                    is_helpful,
                });

            if (error) {
                console.error('Error creating vote:', error);
                return NextResponse.json(
                    { error: 'Failed to create vote' },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Vote error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid data', details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to vote on review' },
            { status: 500 }
        );
    }
}