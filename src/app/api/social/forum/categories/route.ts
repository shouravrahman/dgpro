import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: categories, error } = await supabase
            .from('forum_categories')
            .select(`
        *,
        topics:forum_topics(count),
        latest_topic:forum_topics(
          id,
          title,
          slug,
          created_at,
          author:user_profiles!author_id(
            user_id,
            display_name,
            avatar_url
          )
        )
      `)
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) {
            console.error('Error fetching forum categories:', error);
            return NextResponse.json(
                { error: 'Failed to fetch forum categories' },
                { status: 500 }
            );
        }

        // Process the data to get topic counts and latest topics
        const processedCategories = categories?.map(category => ({
            ...category,
            topic_count: category.topics?.[0]?.count || 0,
            latest_topic: category.latest_topic?.[0] || null,
        }));

        return NextResponse.json({ categories: processedCategories });
    } catch (error) {
        console.error('Forum categories API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}