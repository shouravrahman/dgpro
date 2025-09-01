import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const topicId = params.id;

        // Increment view count
        await supabase
            .from('forum_topics')
            .update({ view_count: supabase.sql`view_count + 1` })
            .eq('id', topicId);

        // Fetch topic with details
        const { data: topic, error } = await supabase
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
            .eq('id', topicId)
            .single();

        if (error) {
            console.error('Error fetching forum topic:', error);
            return NextResponse.json(
                { error: 'Topic not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ topic });
    } catch (error) {
        console.error('Forum topic API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createRouteHandlerClient({ cookies });

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const topicId = params.id;
        const body = await request.json();

        // Check if user owns the topic or is admin/moderator
        const { data: topic } = await supabase
            .from('forum_topics')
            .select('author_id')
            .eq('id', topicId)
            .single();

        if (!topic) {
            return NextResponse.json(
                { error: 'Topic not found' },
                { status: 404 }
            );
        }

        const isOwner = topic.author_id === session.user.id;

        // Check if user is admin/moderator
        const { data: adminUser } = await supabase
            .from('admin_users')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

        const isAdmin = adminUser && ['super_admin', 'admin', 'moderator'].includes(adminUser.role);

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Update topic
        const updateData: any = {};
        if (body.title) updateData.title = body.title;
        if (body.content) updateData.content = body.content;
        if (isAdmin && typeof body.is_pinned === 'boolean') updateData.is_pinned = body.is_pinned;
        if (isAdmin && typeof body.is_locked === 'boolean') updateData.is_locked = body.is_locked;

        updateData.updated_at = new Date().toISOString();

        const { data: updatedTopic, error } = await supabase
            .from('forum_topics')
            .update(updateData)
            .eq('id', topicId)
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
            console.error('Error updating topic:', error);
            return NextResponse.json(
                { error: 'Failed to update topic' },
                { status: 500 }
            );
        }

        return NextResponse.json({ topic: updatedTopic });
    } catch (error) {
        console.error('Topic update error:', error);
        return NextResponse.json(
            { error: 'Failed to update topic' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createRouteHandlerClient({ cookies });

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const topicId = params.id;

        // Check if user owns the topic or is admin/moderator
        const { data: topic } = await supabase
            .from('forum_topics')
            .select('author_id')
            .eq('id', topicId)
            .single();

        if (!topic) {
            return NextResponse.json(
                { error: 'Topic not found' },
                { status: 404 }
            );
        }

        const isOwner = topic.author_id === session.user.id;

        // Check if user is admin/moderator
        const { data: adminUser } = await supabase
            .from('admin_users')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

        const isAdmin = adminUser && ['super_admin', 'admin', 'moderator'].includes(adminUser.role);

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        const { error } = await supabase
            .from('forum_topics')
            .delete()
            .eq('id', topicId);

        if (error) {
            console.error('Error deleting topic:', error);
            return NextResponse.json(
                { error: 'Failed to delete topic' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Topic deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete topic' },
            { status: 500 }
        );
    }
}