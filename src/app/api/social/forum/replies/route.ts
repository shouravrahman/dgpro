import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createReplySchema = z.object({
    topic_id: z.string().uuid(),
    content: z.string().min(1).max(10000),
    parent_reply_id: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const topicId = searchParams.get('topic_id');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        if (!topicId) {
            return NextResponse.json(
                { error: 'Topic ID is required' },
                { status: 400 }
            );
        }

        const offset = (page - 1) * limit;

        const { data: replies, error, count } = await supabase
            .from('forum_replies')
            .select(`
        *,
        author:user_profiles!author_id (
          user_id,
          display_name,
          avatar_url,
          is_verified,
          reputation_score
        ),
        parent_reply:forum_replies!parent_reply_id (
          id,
          content,
          author:user_profiles!author_id (
            user_id,
            display_name
          )
        )
      `)
            .eq('topic_id', topicId)
            .order('created_at', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching forum replies:', error);
            return NextResponse.json(
                { error: 'Failed to fetch forum replies' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            replies,
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error) {
        console.error('Forum replies API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = createReplySchema.parse(body);

        // Check if topic exists and is not locked
        const { data: topic } = await supabase
            .from('forum_topics')
            .select('id, is_locked, author_id')
            .eq('id', validatedData.topic_id)
            .single();

        if (!topic) {
            return NextResponse.json(
                { error: 'Topic not found' },
                { status: 404 }
            );
        }

        if (topic.is_locked) {
            return NextResponse.json(
                { error: 'Topic is locked' },
                { status: 400 }
            );
        }

        // If replying to a specific reply, check it exists
        if (validatedData.parent_reply_id) {
            const { data: parentReply } = await supabase
                .from('forum_replies')
                .select('id')
                .eq('id', validatedData.parent_reply_id)
                .eq('topic_id', validatedData.topic_id)
                .single();

            if (!parentReply) {
                return NextResponse.json(
                    { error: 'Parent reply not found' },
                    { status: 404 }
                );
            }
        }

        const { data: reply, error } = await supabase
            .from('forum_replies')
            .insert({
                ...validatedData,
                author_id: session.user.id,
            })
            .select(`
        *,
        author:user_profiles!author_id (
          user_id,
          display_name,
          avatar_url,
          is_verified,
          reputation_score
        ),
        parent_reply:forum_replies!parent_reply_id (
          id,
          content,
          author:user_profiles!author_id (
            user_id,
            display_name
          )
        )
      `)
            .single();

        if (error) {
            console.error('Error creating forum reply:', error);
            return NextResponse.json(
                { error: 'Failed to create forum reply' },
                { status: 500 }
            );
        }

        // Create notification for topic author (if not replying to own topic)
        if (topic.author_id !== session.user.id) {
            await supabase
                .from('notifications')
                .insert({
                    user_id: topic.author_id,
                    type: 'reply',
                    title: 'New Reply to Your Topic',
                    message: 'Someone replied to your forum topic',
                    action_url: `/forum/topics/${validatedData.topic_id}#reply-${reply.id}`,
                    metadata: {
                        reply_id: reply.id,
                        topic_id: validatedData.topic_id,
                        author_id: session.user.id
                    },
                });
        }

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('Reply creation error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid data', details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to create reply' },
            { status: 500 }
        );
    }
}