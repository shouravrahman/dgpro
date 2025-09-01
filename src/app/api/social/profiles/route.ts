import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateProfileSchema = z.object({
    display_name: z.string().min(1).max(100).optional(),
    bio: z.string().max(500).optional(),
    website_url: z.string().url().optional().or(z.literal('')),
    location: z.string().max(100).optional(),
    skills: z.array(z.string()).max(20).optional(),
    social_links: z.record(z.string().url()).optional(),
    portfolio_showcase: z.array(z.string().uuid()).max(10).optional(),
});

export async function GET(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select(`
        *,
        user_badges (
          id,
          earned_at,
          badge:badges (
            id,
            name,
            description,
            icon,
            color
          )
        )
      `)
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return NextResponse.json(
                { error: 'Failed to fetch profile' },
                { status: 500 }
            );
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error('Profile API error:', error);
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
        const validatedData = updateProfileSchema.parse(body);

        // Check if profile exists
        const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .single();

        let result;
        if (existingProfile) {
            // Update existing profile
            const { data, error } = await supabase
                .from('user_profiles')
                .update({
                    ...validatedData,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', session.user.id)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Create new profile
            const { data, error } = await supabase
                .from('user_profiles')
                .insert({
                    user_id: session.user.id,
                    ...validatedData,
                })
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        return NextResponse.json({ profile: result });
    } catch (error) {
        console.error('Profile update error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid data', details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    return POST(request); // Alias for POST
}