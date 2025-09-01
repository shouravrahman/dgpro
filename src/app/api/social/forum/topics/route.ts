import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createTopicSchema = z.object({
    category_id: z.string().uuid(),
    title: z.string().min(1).max(200),
    content: z.string().min(1).max(10000),
});

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('category_id');
        const query = searchParams.get('query');
        const sort = searchParams.get('sort') || 'latest';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const offset = (page - 1) * limit;

        let dbQuery = supabase
            .from('forum_topics')
            .select(`
        *,
        category:forum_categories!category_id (
          id,
          name,
          slug,
          color
        ),
        author:user_profiles!author_id (
          user_id,
          display_name,
          avatar_url,
          is_verified,
          reputation_score
        ),
        last_reply_author:user_profiles!last_reply_by (
          user_id,
          display_name,
          avatar_url
        )
      `)
            .range(offset, offset + limit - 1);

        // Apply filters
        if (categoryId) {
            dbQuery = dbQuery.eq('category_id', categoryId);
        }
        if (query) {
            dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
        }

        // Apply sorting
        switch (sort) {
            case 'popular':
                dbQuery = dbQuery.order('reply_count', { ascending: false });
                break;
            case 'oldest':
                dbQuery = dbQuery.order('created_at', { ascending: true });
                break;
            case 'latest':
            default:
                // Pinned topics first, then by last reply
                dbQuery = dbQuery
                    .order('is_pinned', { ascending: false })
                    .order('last_reply_at', { ascending: false });
                break;
        }

        const { data: topics, error, count } = await dbQuery;

        if (error) {
            console.error('Error fetching forum topics:', error);
            return NextResponse.json(
                { error: 'Failed to fetch forum topics' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            topics,
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error) {
        console.error('Forum topics API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = createTopicSchema.parse(body);

        // Check if category exists and is active
        const { data: category } = await supabase
            .from('forum_categories')
            .select('id, is_active')
            .eq('id', validatedData.category_id)
            .eq('is_active', true)
            .single();

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found or inactive' },
                { status: 404 }
            );
        }

        // Generate unique slug
        let baseSlug = generateSlug(validatedData.title);
        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const { data: existingTopic } = await supabase
                .from('forum_topics')
                .select('id')
                .eq('slug', slug)
                .single();

            if (!existingTopic) break;

            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const { data: topic, error } = await supabase
            .from('forum_topics')
            .insert({
                ...validatedData,
                author_id: session.user.id,
                slug,
            })
            .select(`
        *,
        category:forum_categories!category_id (
          id,
          name,
          slug,
          color
        ),
        author:user_profiles!author_id (
          user_id,
          display_name,
          avatar_url,
          is_verified,
          reputation_score
        )
      `)
            .single();

        if (error) {
            console.error('Error creating forum topic:', error);
            return NextResponse.json(
                { error: 'Failed to create forum topic' },
                { status: 500 }
            );
        }

        return NextResponse.json({ topic });
    } catch (error) {
        console.error('Topic creation error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid data', details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to create topic' },
            { status: 500 }
        );
    }
}