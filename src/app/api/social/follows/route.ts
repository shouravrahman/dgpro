import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const followSchema = z.object({
    following_id: z.string().uuid(),
});

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');
        const type = searchParams.get('type'); // 'followers' or 'following'
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const offset = (page - 1) * limit;

        let query = supabase
            .from('user_follows')
            .select(`
        id,
        created_at,
        ${type === 'followers' ? 'follower_id' : 'following_id'},
        ${type === 'followers' ? 'follower:user_profiles!follower_id' : 'following:user_profiles!following_id'} (
          user_id,
          display_name,
          avatar_url,
          bio,
          reputation_score,
          is_verified
        )
      `)
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });

        if (type === 'followers') {
            query = query.eq('following_id', userId);
        } else {
            query = query.eq('follower_id', userId);
        }

        const { data: follows, error, count } = await query;

        if (error) {
            console.error('Error fetching follows:', error);
            return NextResponse.json(
                { error: 'Failed to fetch follows' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            follows,
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error) {
        console.error('Follows API error:', error);
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
        const { following_id } = followSchema.parse(body);

        // Check if already following
        const { data: existingFollow } = await supabase
            .from('user_follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', following_id)
            .single();

        if (existingFollow) {
            return NextResponse.json(
                { error: 'Already following this user' },
                { status: 400 }
            );
        }

        // Can't follow yourself
        if (user.id === following_id) {
            return NextResponse.json(
                { error: 'Cannot follow yourself' },
                { status: 400 }
            );
        }

        const { data: follow, error } = await supabase
            .from('user_follows')
            .insert({
                follower_id: user.id,
                following_id,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating follow:', error);
            return NextResponse.json(
                { error: 'Failed to follow user' },
                { status: 500 }
            );
        }

        // Create notification for the followed user
        await supabase
            .from('notifications')
            .insert({
                user_id: following_id,
                type: 'follow',
                title: 'New Follower',
                message: 'Someone started following you',
                metadata: { follower_id: user.id },
            });

        return NextResponse.json({ follow });
    } catch (error) {
        console.error('Follow creation error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid data', details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to follow user' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const followingId = searchParams.get('following_id');

        if (!followingId) {
            return NextResponse.json(
                { error: 'Following ID is required' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('user_follows')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', followingId);

        if (error) {
            console.error('Error unfollowing user:', error);
            return NextResponse.json(
                { error: 'Failed to unfollow user' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unfollow error:', error);
        return NextResponse.json(
            { error: 'Failed to unfollow user' },
            { status: 500 }
        );
    }
}